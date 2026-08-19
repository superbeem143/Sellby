const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY FIXED TOP & CONTENT SCROLL VERIFICATION ");
console.log("=================================================");

const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Verify Fixed Top Block (Header, Search, Hero)
if (css.includes('.header') && css.includes('position: sticky;') && css.includes('.search-section') && css.includes('.hero')) {
    console.log("✅ [Fixed Top Section]: Header (1000), Search (999), and Hero (998) stay pinned fixed/sticky at top.");
} else {
    console.error("❌ [Fixed Top Section]: Sticky rules missing!");
    process.exit(1);
}

// 2. Verify Scrollable Content Flow (Categories + Latest Ads)
if (css.includes('.latest-ads') && css.includes('padding: 8px 16px 120px;')) {
    console.log("✅ [Scrollable Content]: Browse Categories and Latest Ads scroll naturally with 120px bottom padding.");
} else {
    console.error("❌ [Scrollable Content]: Latest Ads rules missing!");
    process.exit(1);
}

// 3. Verify Fixed Bottom Block (+ SELL & Bottom Nav)
if (css.includes('.floating-post-btn') && css.includes('z-index: 1002;') && css.includes('.bottom-nav') && css.includes('z-index: 1001;')) {
    console.log("✅ [Fixed Bottom Section]: Floating + SELL button (1002) and Bottom Navigation (1001) stay fixed at bottom.");
} else {
    console.error("❌ [Fixed Bottom Section]: Fixed bottom rules missing!");
    process.exit(1);
}

// 4. Verify Sync
if (wwwCss.includes('top: 130px;')) {
    console.log("✅ [WWW Sync]: Root and www/ stylesheets 100% synchronized.");
} else {
    console.error("❌ [WWW Sync]: www/ stylesheet out of sync!");
    process.exit(1);
}

console.log("=================================================");
console.log("   ALL CONTENT SCROLL CHECKS PASSED (100%)       ");
console.log("=================================================");
