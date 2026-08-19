const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let browserPath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : (fs.existsSync(EDGE_PATH) ? EDGE_PATH : null);
if (!browserPath) {
    console.error("No Chrome or Edge browser binary found on system!");
    process.exit(1);
}

console.log(`[CDP Engine] Using Browser Binary: ${browserPath}`);

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
            console.error("[CDP Engine] Target page not found.");
            browserProcess.kill();
            process.exit(1);
        }

        const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
        let msgId = 1;

        function send(method, params = {}) {
            return new Promise((resolve) => {
                const currentId = msgId++;
                const listener = (evt) => {
                    const data = JSON.parse(evt.data);
                    if (data.id === currentId) {
                        ws.removeEventListener('message', listener);
                        resolve(data.result);
                    }
                };
                ws.addEventListener('message', listener);
                ws.send(JSON.stringify({ id: currentId, method, params }));
            });
        }

        ws.onopen = async () => {
            console.log("[CDP Engine] WebSocket Connected!");

            await send("Page.enable");
            await send("Runtime.enable");

            // Set session storage on origin before navigating
            await send("Page.navigate", { url: "http://127.0.0.1:8080/admin-login.html" });
            await new Promise(r => setTimeout(r, 2000));

            await send("Runtime.evaluate", {
                expression: `
                    sessionStorage.setItem("adminSessionActive", "true");
                    sessionStorage.setItem("adminSessionEmail", "sellby369@gmail.com");
                    sessionStorage.setItem("adminSessionTime", Date.now().toString());
                `
            });

            console.log("[CDP Engine] Injected valid Admin Session into SessionStorage.");

            // Navigate to Admin Portal
            await send("Page.navigate", { url: "http://127.0.0.1:8080/admin-portal.html" });
            await new Promise(r => setTimeout(r, 3500));

            // Evaluate Admin Portal state
            const portalMetrics = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        return {
                            url: window.location.href,
                            title: document.title,
                            dashTotalUsers: document.getElementById('dashTotalUsers')?.innerText,
                            dashTotalAds: document.getElementById('dashTotalAds')?.innerText,
                            dashActiveAds: document.getElementById('dashActiveAds')?.innerText,
                            dashSoldExpiredAds: document.getElementById('dashSoldExpiredAds')?.innerText,
                            adminEmail: document.getElementById('adminUserEmail')?.innerText
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log("📊 [Real Chrome CDP] Admin Portal Metrics:\n", JSON.stringify(portalMetrics?.result?.value, null, 2));

            // Navigate to Ads tab
            await send("Runtime.evaluate", { expression: "window.navigateToTab('ads');" });
            await new Promise(r => setTimeout(r, 2500));

            // Inspect loaded ads grid
            const adsGridState = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const grid = document.getElementById('adsGrid');
                        const cards = Array.from(grid.querySelectorAll('.ad-card-item')).map((c, idx) => ({
                            index: idx,
                            title: c.querySelector('.ad-card-title')?.innerText,
                            price: c.querySelector('.ad-card-price')?.innerText,
                            meta: c.querySelector('.ad-card-meta')?.innerText,
                            status: c.querySelector('.status-pill')?.innerText
                        }));
                        return { totalLoaded: cards.length, sampleCards: cards.slice(0, 3) };
                    })()
                `,
                returnByValue: true
            });
            console.log("📦 [Real Chrome CDP] Ads Management Grid:\n", JSON.stringify(adsGridState?.result?.value, null, 2));

            const totalLoaded = adsGridState?.result?.value?.totalLoaded || 0;
            if (totalLoaded === 0) {
                console.log("⚠️ No ads currently loaded in Firestore grid to test block.");
                ws.close();
                browserProcess.kill();
                process.exit(0);
                return;
            }

            // Click Inspect Details on the first ad
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const btn = document.querySelector('.ad-card-item .btn-edit');
                        if (btn) btn.click();
                    })()
                `
            });
            await new Promise(r => setTimeout(r, 1200));

            // Verify Inspect Details View fields & Customer Contact Privacy
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
                            privacyProtected: !/@|phone|whatsapp|\+91/i.test(document.getElementById('modalAdSeller')?.innerText || '')
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log("📋 [Real Chrome CDP] Inspect Details Modal Verification:\n", JSON.stringify(modalContent?.result?.value, null, 2));

            // Click Block Ad button
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const btn = document.getElementById('modalBlockAdBtn');
                        if (btn && !btn.disabled) btn.click();
                    })()
                `
            });
            await new Promise(r => setTimeout(r, 1200));

            // Select "Suspicious / Fraud" and enter Moderation Notes
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const select = document.getElementById('blockReasonSelect');
                        const custom = document.getElementById('blockReasonCustom');
                        if (select) select.value = "Suspicious / Fraud";
                        if (custom) custom.value = "Real Chrome CDP Automated Moderation Verification Test";
                    })()
                `
            });

            // Click Confirm & Block Ad
            await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const btn = document.getElementById('confirmBlockAdBtn');
                        if (btn) btn.click();
                    })()
                `
            });
            console.log("⚡ [Real Chrome CDP] Confirm & Block Ad Action Triggered!");

            await new Promise(r => setTimeout(r, 3500));

            // Verify Post-Block Firestore Updates & In-Portal UI State
            const postBlockState = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const statusMsg = document.getElementById('blockAdModalStatusMsg');
                        const blockModal = document.getElementById('blockAdModal');
                        return {
                            statusMessageText: statusMsg?.innerText,
                            modalClosed: blockModal?.style.display === 'none',
                            dashActiveAds: document.getElementById('dashActiveAds')?.innerText,
                            dashSoldExpiredAds: document.getElementById('dashSoldExpiredAds')?.innerText,
                            dashTotalAds: document.getElementById('dashTotalAds')?.innerText
                        };
                    })()
                `,
                returnByValue: true
            });
            console.log("🎉 [Real Chrome CDP] Post-Block Final Verified Metrics:\n", JSON.stringify(postBlockState?.result?.value, null, 2));

            ws.close();
            browserProcess.kill();
            process.exit(0);
        };
    } catch (err) {
        console.error("[CDP Engine] Execution Error:", err);
        browserProcess.kill();
        process.exit(1);
    }
}, 2500);
