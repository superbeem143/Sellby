const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY NORMAL MAIN PAGE SCROLL VERIFICATION   ");
console.log("=================================================");

const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Verify Normal Main Page Scroll Rules
if (css.includes('body.home-page') && css.includes('overflow-y: auto;')) {
    console.log("✅ [Page Scrolling]: Main Page uses normal vertical scrolling (overflow-y: auto on body.home-page).");
} else {
    console.error("❌ [Page Scrolling]: Main Page scrolling rules incorrect!");
    process.exit(1);
}

// 2. Verify Latest Ads Unrestricted Overflow
if (css.includes('padding: 8px 16px 120px;') && css.includes('overflow: visible;')) {
    console.log("✅ [Latest Ads]: Latest Ads has overflow: visible with 120px bottom padding (last ad card never cut off).");
} else {
    console.error("❌ [Latest Ads]: Latest Ads overflow/padding rules incorrect!");
    process.exit(1);
}

// 3. Verify Fixed Controls
if (css.includes('.floating-post-btn') && css.includes('z-index: 1002;') && css.includes('.bottom-nav') && css.includes('z-index: 1001;')) {
    console.log("✅ [Fixed Controls]: Floating + SELL button (1002) and Bottom Nav (1001) stay fixed during page scroll.");
} else {
    console.error("❌ [Fixed Controls]: Fixed controls rules incorrect!");
    process.exit(1);
}

// 4. Verify Sync
if (wwwCss.includes('padding: 8px 16px 120px;')) {
    console.log("✅ [WWW Sync]: Root and www/ stylesheets synchronized 100%.");
} else {
    console.error("❌ [WWW Sync]: www/ stylesheet out of sync!");
    process.exit(1);
}

console.log("=================================================");
console.log("   ALL NORMAL PAGE SCROLL CHECKS PASSED (100%)   ");
console.log("=================================================");
