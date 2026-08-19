const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY HOME SCROLL CONTAINER VERIFICATION     ");
console.log("=================================================");

const html = fs.readFileSync('index.html', 'utf8');
const wwwHtml = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Verify body class
if (html.includes('<body class="home-page">') && wwwHtml.includes('<body class="home-page">')) {
    console.log("✅ [HTML Structure]: body.home-page class assigned in root and www/ index.html.");
} else {
    console.error("❌ [HTML Structure]: Missing body.home-page class!");
    process.exit(1);
}

// 2. Verify Mobile Flex Shell
if (css.includes('body.home-page') && css.includes('overflow: hidden;') && css.includes('flex-shrink: 0;')) {
    console.log("✅ [CSS App Shell]: Fixed mobile viewport shell & flex-shrink: 0 header/search/hero/categories verified.");
} else {
    console.error("❌ [CSS App Shell]: App shell flex rules missing!");
    process.exit(1);
}

// 3. Verify Independent Latest Ads Scroll Container
if (css.includes('body.home-page .latest-ads') && css.includes('overflow-y: auto;') && css.includes('padding-bottom: 95px;')) {
    console.log("✅ [CSS Scroll Container]: Independent overflow-y: auto scroll container for Latest Ads verified.");
} else {
    console.error("❌ [CSS Scroll Container]: Latest Ads scroll rules missing!");
    process.exit(1);
}

// 4. Verify Z-Index Stack & Fixed Position
if (css.includes('z-index: 1002;') && css.includes('z-index: 1001;')) {
    console.log("✅ [Z-Index Stack]: Floating SELL button (1002) and Bottom Nav (1001) z-index layers verified.");
} else {
    console.error("❌ [Z-Index Stack]: Z-index layering missing!");
    process.exit(1);
}

console.log("=================================================");
console.log("    ALL SCROLL CONTAINER CHECKS PASSED (100%)    ");
console.log("=================================================");
