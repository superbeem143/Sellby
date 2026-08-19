const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let browserPath = null;
if (fs.existsSync(CHROME_PATH)) {
    browserPath = CHROME_PATH;
} else if (fs.existsSync(EDGE_PATH)) {
    browserPath = EDGE_PATH;
}

if (!browserPath) {
    console.error("No Chrome or Edge browser binary found on system!");
    process.exit(1);
}

console.log(`Using system browser binary: ${browserPath}`);

const PORT = 9222;
const browserProcess = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
]);

setTimeout(async () => {
    try {
        const response = await fetch(`http://127.0.0.1:${PORT}/json`);
        const pages = await response.json();
        
        const targetPage = pages.find(p => p.type === 'page');
        if (!targetPage) {
            console.error("Could not find page in CDP list:", pages);
            browserProcess.kill();
            process.exit(1);
        }

        console.log("Target Page Found:", targetPage.url);
        const wsUrl = targetPage.webSocketDebuggerUrl;
        const ws = new WebSocket(wsUrl);
        let id = 1;

        function send(method, params = {}) {
            return new Promise((resolve) => {
                const reqId = id++;
                const handler = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.id === reqId) {
                        ws.removeEventListener('message', handler);
                        resolve(data.result);
                    }
                };
                ws.addEventListener('message', handler);
                ws.send(JSON.stringify({ id: reqId, method, params }));
            });
        }

        ws.onopen = async () => {
            console.log("CDP WebSocket connected to blank page!");

            await send("Runtime.enable");
            await send("Page.enable");

            console.log("Navigating to http://127.0.0.1:8080/admin-portal.html ...");
            await send("Page.navigate", { url: "http://127.0.0.1:8080/admin-portal.html" });

            await new Promise(r => setTimeout(r, 4000));

            // Check current URL
            const urlRes = await send("Runtime.evaluate", {
                expression: `window.location.href`,
                returnByValue: true
            });
            const currentUrl = urlRes.result.value;
            console.log("Navigated Page URL:", currentUrl);

            // Handle Login if redirected to admin-login.html
            if (currentUrl && currentUrl.includes("admin-login.html")) {
                console.log("Performing Admin Login Flow in real browser...");
                
                const loginStep1 = await send("Runtime.evaluate", {
                    expression: `
                        (function() {
                            const bootInput = document.getElementById('bootstrapPassword');
                            const secInput = document.getElementById('secretPassword');
                            const bootVisible = bootInput && bootInput.offsetParent !== null;

                            if (bootVisible) {
                                bootInput.value = '999999';
                                document.getElementById('adminLoginForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                return { step: 1, type: 'bootstrap' };
                            } else if (secInput) {
                                secInput.value = '999999';
                                document.getElementById('adminLoginForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                return { step: 1, type: 'secret' };
                            }
                            return { step: 0 };
                        })()
                    `,
                    returnByValue: true
                });

                console.log("Login Step 1 Result:", loginStep1.result.value);
                await new Promise(r => setTimeout(r, 2000));

                // Check if step 2 password creation is needed
                const loginStep2 = await send("Runtime.evaluate", {
                    expression: `
                        (function() {
                            const secInput = document.getElementById('secretPassword');
                            const confInput = document.getElementById('confirmSecretPassword');
                            const confVisible = confInput && confInput.offsetParent !== null;

                            if (confVisible) {
                                secInput.value = '999999';
                                confInput.value = '999999';
                                document.getElementById('adminLoginForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                                return { step: 2, created: true };
                            }
                            return { step: 2, created: false };
                        })()
                    `,
                    returnByValue: true
                });

                console.log("Login Step 2 Result:", loginStep2.result.value);
                await new Promise(r => setTimeout(r, 2500));

                // Force navigation to admin-portal.html if authenticated
                await send("Page.navigate", { url: "http://127.0.0.1:8080/admin-portal.html" });
                await new Promise(r => setTimeout(r, 3000));
            }

            // Verify Admin Portal loaded
            const portalMetrics = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        return {
                            url: window.location.href,
                            title: document.title,
                            usersCount: document.getElementById('dashTotalUsers')?.innerText,
                            totalAdsCount: document.getElementById('dashTotalAds')?.innerText,
                            activeAdsCount: document.getElementById('dashActiveAds')?.innerText,
                            soldExpiredCount: document.getElementById('dashSoldExpiredAds')?.innerText,
                            adminEmail: document.getElementById('adminUserEmail')?.innerText
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log("📊 Admin Portal Page Metrics:", JSON.stringify(portalMetrics.result.value, null, 2));

            // Navigate to 'ads' tab
            await send("Runtime.evaluate", {
                expression: `window.navigateToTab('ads');`
            });

            await new Promise(r => setTimeout(r, 2500));

            // Inspect loaded ads grid
            const adsGridState = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const grid = document.getElementById('adsGrid');
                        const cards = Array.from(grid.querySelectorAll('.ad-card-item')).map((c, index) => {
                            return {
                                index: index,
                                title: c.querySelector('.ad-card-title')?.innerText,
                                price: c.querySelector('.ad-card-price')?.innerText,
                                meta: c.querySelector('.ad-card-meta')?.innerText,
                                status: c.querySelector('.status-pill')?.innerText
                            };
                        });
                        return { totalLoadedCards: cards.length, cards: cards.slice(0, 5) };
                    })()
                `,
                returnByValue: true
            });

            console.log("📦 Ads Grid Loaded State:", JSON.stringify(adsGridState.result.value, null, 2));

            if (!adsGridState.result.value || adsGridState.result.value.totalLoadedCards === 0) {
                console.log("No ads currently in Firestore grid to test block.");
                ws.close();
                browserProcess.kill();
                process.exit(0);
                return;
            }

            // Click Inspect Details on first ad
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const inspectBtn = document.querySelector('.ad-card-item .btn-edit');
                        if (inspectBtn) inspectBtn.click();
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1200));

            // Verify Inspect Details Modal Content
            const modalContent = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        return {
                            title: document.getElementById('modalAdTitle')?.innerText,
                            category: document.getElementById('modalAdCategory')?.innerText,
                            price: document.getElementById('modalAdPrice')?.innerText,
                            location: document.getElementById('modalAdLocation')?.innerText,
                            status: document.getElementById('modalAdStatus')?.innerText,
                            publishedDate: document.getElementById('modalAdPublishedDate')?.innerText,
                            expiryDate: document.getElementById('modalAdExpiryDate')?.innerText,
                            durationDays: document.getElementById('modalAdDuration')?.innerText,
                            remainingDays: document.getElementById('modalAdRemainingDays')?.innerText,
                            sellerUid: document.getElementById('modalAdSeller')?.innerText,
                            description: document.getElementById('modalAdDescription')?.innerText,
                            modalVisible: document.getElementById('adDetailModal')?.style.display !== 'none',
                            privacyProtected: !/@|phone|whatsapp|\+91/i.test(document.getElementById('modalAdSeller')?.innerText || '')
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log("📋 Inspect Details Modal Content:", JSON.stringify(modalContent.result.value, null, 2));

            // Click Block Ad button inside modal
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const blockBtn = document.getElementById('modalBlockAdBtn');
                        if (blockBtn && !blockBtn.disabled) blockBtn.click();
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1200));

            // Fill Block Reason Modal
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const reasonSelect = document.getElementById('blockReasonSelect');
                        const customInput = document.getElementById('blockReasonCustom');

                        if (reasonSelect) reasonSelect.value = "Suspicious / Fraud";
                        if (customInput) customInput.value = "Automated Real Chrome CDP Moderation Test";
                    })()
                `
            });

            // Click Confirm & Block Ad
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const confirmBtn = document.getElementById('confirmBlockAdBtn');
                        if (confirmBtn) confirmBtn.click();
                    })()
                `
            });

            console.log("⚡ Confirm Block Action Executed!");

            await new Promise(r => setTimeout(r, 3000));

            // Post-block verification
            const postBlockState = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const statusMsg = document.getElementById('blockAdModalStatusMsg');
                        const blockModal = document.getElementById('blockAdModal');
                        
                        return {
                            statusMessageText: statusMsg?.innerText,
                            blockModalVisible: blockModal?.style.display !== 'none',
                            dashActiveAds: document.getElementById('dashActiveAds')?.innerText,
                            dashSoldExpiredAds: document.getElementById('dashSoldExpiredAds')?.innerText,
                            dashTotalAds: document.getElementById('dashTotalAds')?.innerText
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log("🎉 Post-Block Final State:", JSON.stringify(postBlockState.result.value, null, 2));

            ws.close();
            browserProcess.kill();
            process.exit(0);
        };
    } catch (err) {
        console.error("CDP Test error:", err);
        browserProcess.kill();
        process.exit(1);
    }
}, 3000);
