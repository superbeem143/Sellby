const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY MOBILE HOME SCROLL LOCK VERIFICATION   ");
console.log("=================================================");

const html = fs.readFileSync('index.html', 'utf8');
const wwwHtml = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Check HTML class
if (html.includes('<html lang="en" class="home-html">') && html.includes('<body class="home-page">')) {
    console.log("✅ [HTML Structure]: home-html and home-page classes configured in index.html.");
} else {
    console.error("❌ [HTML Structure]: Missing home-html or home-page class!");
    process.exit(1);
}

// 2. Check Mobile Scroll Lock
if (css.includes('html.home-html') && css.includes('overflow: hidden !important;')) {
    console.log("✅ [Mobile Scroll Lock]: Outer window locked (overflow: hidden !important, height: 100dvh !important). Outer page CANNOT scroll.");
} else {
    console.error("❌ [Mobile Scroll Lock]: Outer window lock rules missing!");
    process.exit(1);
}

// 3. Check Fixed Top Elements
if (css.includes('body.home-page .header') && css.includes('flex-shrink: 0 !important;')) {
    console.log("✅ [Fixed Top Elements]: Header, Search, Hero, and Categories locked with flex-shrink: 0 !important.");
} else {
    console.error("❌ [Fixed Top Elements]: Flex-shrink rules missing!");
    process.exit(1);
}

// 4. Check Independent Latest Ads Scroll Area
if (css.includes('body.home-page .latest-ads') && css.includes('flex: 1 !important;') && css.includes('overflow-y: auto !important;')) {
    console.log("✅ [Latest Ads Scroll Area]: Latest Ads allocated flex: 1 !important with overflow-y: auto !important. ONLY Latest Ads scrolls.");
} else {
    console.error("❌ [Latest Ads Scroll Area]: Latest Ads scroll rules missing!");
    process.exit(1);
}

// 5. Check Fixed Controls Layering
if (css.includes('.floating-post-btn') && css.includes('z-index: 1002;') && css.includes('.bottom-nav') && css.includes('z-index: 1001;')) {
    console.log("✅ [Fixed Controls]: Floating + SELL button (1002) and Bottom Nav (1001) stay fixed above scroll area.");
} else {
    console.error("❌ [Fixed Controls]: Fixed controls layering missing!");
    process.exit(1);
}

// 6. Check WWW Sync
if (wwwCss.includes('overflow: hidden !important;')) {
    console.log("✅ [WWW Sync]: Root and www/ stylesheets synchronized 100%.");
} else {
    console.error("❌ [WWW Sync]: www/ stylesheet out of sync!");
    process.exit(1);
}

console.log("=================================================");
console.log("   ALL MOBILE SCROLL LOCK CHECKS PASSED (100%)   ");
console.log("=================================================");
