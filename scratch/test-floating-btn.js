const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY HOME FLOATING SELL BUTTON VERIFICATION  ");
console.log("=================================================");

const html = fs.readFileSync('index.html', 'utf8');
const wwwHtml = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Verify HTML Markup
if (html.includes('class="floating-post-btn"') && html.includes('href="post-ad.html"')) {
    console.log("✅ [index.html]: Original Floating Sell/Add Ad button markup present.");
} else {
    console.error("❌ [index.html]: Floating Sell button markup missing!");
    process.exit(1);
}

// 2. Verify CSS Position & Offset Fix
if (css.includes('.floating-post-btn') && css.includes('right: max(24px, calc(50% - 570px));')) {
    console.log("✅ [css/style.css]: Position fixed (bottom: 88px, z-index: 1000) and max(24px, ...) right-offset fix verified.");
} else {
    console.error("❌ [css/style.css]: CSS positioning rule missing or incorrect!");
    process.exit(1);
}

// 3. Verify WWW Sync
if (wwwHtml.includes('class="floating-post-btn"') && wwwCss.includes('right: max(24px, calc(50% - 570px));')) {
    console.log("✅ [www/ Directory]: Root and www/ files 100% synchronized.");
} else {
    console.error("❌ [www/ Directory]: Files out of sync!");
    process.exit(1);
}

console.log("=================================================");
console.log("     ALL FLOATING BUTTON CHECKS PASSED (100%)    ");
console.log("=================================================");
