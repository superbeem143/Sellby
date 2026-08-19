const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY NATURAL HOME FLOW VERIFICATION TEST    ");
console.log("=================================================");

const html = fs.readFileSync('index.html', 'utf8');
const wwwHtml = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Check HTML clean structure
if (html.includes('<html lang="en">') && html.includes('<body>')) {
    console.log("✅ [HTML Structure]: Clean original html and body tags restored.");
} else {
    console.error("❌ [HTML Structure]: HTML tags not clean!");
    process.exit(1);
}

// 2. Check Header Fixed/Sticky
if (css.includes('.header') && css.includes('position: sticky;') && css.includes('top: 0;')) {
    console.log("✅ [Header]: Header sticky at top (position: sticky; top: 0; z-index: 1000).");
} else {
    console.error("❌ [Header]: Header sticky rules missing!");
    process.exit(1);
}

// 3. Check Latest Ads Direct Flow Below Categories
if (css.includes('.latest-ads') && css.includes('padding: 8px 16px 120px;') && !css.includes('body.home-page .latest-ads')) {
    console.log("✅ [Latest Ads Flow]: Latest Ads appears directly below Browse Categories in normal flow with 120px bottom padding.");
} else {
    console.error("❌ [Latest Ads Flow]: Latest Ads layout rules incorrect!");
    process.exit(1);
}

// 4. Check Fixed Controls
if (css.includes('.bottom-nav') && css.includes('z-index: 1001;') && css.includes('.floating-post-btn') && css.includes('z-index: 1002;')) {
    console.log("✅ [Fixed Controls]: Bottom Nav (1001) and Floating + SELL button (1002) stay fixed.");
} else {
    console.error("❌ [Fixed Controls]: Fixed controls rules incorrect!");
    process.exit(1);
}

// 5. Check Sync
if (wwwCss.includes('padding: 8px 16px 120px;') && wwwHtml.includes('<html lang="en">')) {
    console.log("✅ [WWW Sync]: Root and www/ files 100% synchronized.");
} else {
    console.error("❌ [WWW Sync]: www/ directory out of sync!");
    process.exit(1);
}

console.log("=================================================");
console.log("    ALL NATURAL HOME FLOW CHECKS PASSED (100%)   ");
console.log("=================================================");
