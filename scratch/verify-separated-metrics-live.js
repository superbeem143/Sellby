const { spawn } = require('child_process');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let browserPath = fs.existsSync(CHROME_PATH) ? CHROME_PATH : (fs.existsSync(EDGE_PATH) ? EDGE_PATH : null);
if (!browserPath) {
    console.error("No Chrome or Edge browser binary found on system!");
    process.exit(1);
}

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
            await send("Page.enable");
            await send("Runtime.enable");

            // Inject admin session
            await send("Page.navigate", { url: "http://127.0.0.1:8080/admin-login.html" });
            await new Promise(r => setTimeout(r, 2000));

            await send("Runtime.evaluate", {
                expression: `
                    sessionStorage.setItem("adminSessionActive", "true");
                    sessionStorage.setItem("adminSessionEmail", "sellby369@gmail.com");
                    sessionStorage.setItem("adminSessionTime", Date.now().toString());
                `
            });

            // Open Admin Portal
            await send("Page.navigate", { url: "http://127.0.0.1:8080/admin-portal.html" });
            await new Promise(r => setTimeout(r, 3500));

            // Verify Metrics Cards State
            const metrics = await send("Runtime.evaluate", {
                expression: `
                    (function() {
                        const getVal = (id) => Number(document.getElementById(id)?.innerText || 0);
                        const totalUsers = getVal('dashTotalUsers');
                        const totalAds = getVal('dashTotalAds');
                        const activeAds = getVal('dashActiveAds');
                        const soldAds = getVal('dashSoldAds');
                        const expiredAds = getVal('dashExpiredAds');
                        const blockedAds = getVal('dashBlockedAds');

                        const hasSeparateSoldCard = !!document.getElementById('dashSoldAdsCard');
                        const hasSeparateExpiredCard = !!document.getElementById('dashExpiredAdsCard');
                        const hasSeparateBlockedCard = !!document.getElementById('dashBlockedAdsCard');

                        const sum = activeAds + soldAds + expiredAds + blockedAds;
                        const identityValid = (sum === totalAds);

                        return {
                            totalUsers,
                            totalAds,
                            activeAds,
                            soldAds,
                            expiredAds,
                            blockedAds,
                            sumCalculated: sum,
                            identityValid,
                            hasSeparateSoldCard,
                            hasSeparateExpiredCard,
                            hasSeparateBlockedCard
                        };
                    })()
                `,
                returnByValue: true
            });

            console.log("📊 [Real Browser Live Server Metric Results]:");
            console.log(JSON.stringify(metrics?.result?.value, null, 2));

            ws.close();
            browserProcess.kill();
            process.exit(0);
        };
    } catch (err) {
        console.error("CDP Test Error:", err);
        browserProcess.kill();
        process.exit(1);
    }
}, 2500);
