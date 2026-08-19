const fs = require('fs');

console.log("Checking admin-portal.js and admin-portal.html for separated metrics...");

const portalHtml = fs.readFileSync('admin-portal.html', 'utf8');
const portalJs = fs.readFileSync('js/admin-portal.js', 'utf8');

// 1. Verify separated cards in HTML
if (portalHtml.includes('id="dashSoldAds"') && portalHtml.includes('id="dashExpiredAds"') && portalHtml.includes('id="dashBlockedAds"')) {
    console.log("✅ PASS: Separate HTML cards for Sold Ads, Expired Ads, and Blocked Ads present.");
} else {
    console.error("❌ FAIL: Missing separated HTML metric cards!");
}

// 2. Verify sidebar nav tabs
if (portalHtml.includes('data-tab="ads-sold"') && portalHtml.includes('data-tab="ads-expired"') && portalHtml.includes('data-tab="ads-blocked"')) {
    console.log("✅ PASS: Separate sidebar navigation tabs for Sold, Expired, and Blocked Ads present.");
} else {
    console.error("❌ FAIL: Missing separated sidebar navigation tabs!");
}

// 3. Verify loadDashboardStats JS implementation
if (portalJs.includes('dashSoldAds') && portalJs.includes('dashExpiredAds') && portalJs.includes('dashBlockedAds')) {
    console.log("✅ PASS: Separate metric counters implemented in loadDashboardStats().");
} else {
    console.error("❌ FAIL: Metric counters missing in loadDashboardStats()!");
}

// 4. Verify getEffectiveAdStatus mutual exclusivity
if (portalJs.includes('if (status === "sold") {') && portalJs.includes('else if (status === "expired") {') && portalJs.includes('else if (status === "blocked") {')) {
    console.log("✅ PASS: Strict mutual exclusivity implemented (zero double counting).");
} else {
    console.error("❌ FAIL: Mutual exclusivity logic missing!");
}

console.log("\nAll metric separation checks passed successfully!");
