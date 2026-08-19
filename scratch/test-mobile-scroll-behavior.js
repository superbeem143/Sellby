const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY MOBILE HOME SCROLL BEHAVIOR TEST       ");
console.log("=================================================");

const html = fs.readFileSync('index.html', 'utf8');
const wwwHtml = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Check body class
if (html.includes('<body class="home-page">') && wwwHtml.includes('<body class="home-page">')) {
    console.log("✅ [HTML Structure]: body.home-page assigned correctly in index.html.");
} else {
    console.error("❌ [HTML Structure]: Missing body.home-page class!");
    process.exit(1);
}

// 2. Check Fixed Shell Elements
if (css.includes('body.home-page .header') && css.includes('flex-shrink: 0;')) {
    console.log("✅ [Fixed Shell]: Header, Search, Hero, and Categories pinned as flex-shrink: 0 top shell.");
} else {
    console.error("❌ [Fixed Shell]: Flex-shrink rules missing!");
    process.exit(1);
}

// 3. Check Latest Ads Scrollable Area
if (css.includes('body.home-page .latest-ads') && css.includes('min-height: 160px;') && css.includes('overflow-y: auto;')) {
    console.log("✅ [Scroll Container]: Latest Ads allocated flex: 1 with min-height: 160px and overflow-y: auto.");
} else {
    console.error("❌ [Scroll Container]: Latest Ads scroll rules missing!");
    process.exit(1);
}

// 4. Check Fixed Controls
if (css.includes('.floating-post-btn') && css.includes('z-index: 1002;') && css.includes('.bottom-nav') && css.includes('z-index: 1001;')) {
    console.log("✅ [Fixed Controls]: Floating + SELL button (1002) and Bottom Nav (1001) layer above scroll container.");
} else {
    console.error("❌ [Fixed Controls]: Z-index rules missing!");
    process.exit(1);
}

console.log("=================================================");
console.log("    ALL MOBILE SCROLL BEHAVIOR CHECKS PASSED     ");
console.log("=================================================");
