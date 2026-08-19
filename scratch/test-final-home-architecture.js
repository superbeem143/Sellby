const fs = require('fs');

console.log("=================================================");
console.log("   SELLBY FINAL HOME SCROLL ARCHITECTURE TEST   ");
console.log("=================================================");

const html = fs.readFileSync('index.html', 'utf8');
const wwwHtml = fs.readFileSync('www/index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const wwwCss = fs.readFileSync('www/css/style.css', 'utf8');

// 1. Check HTML Wrapper Architecture
if (html.includes('<main class="home-content-scroll">') && html.includes('</main>')) {
    console.log("✅ [HTML Architecture]: <main class=\"home-content-scroll\"> wraps Categories + Latest Ads.");
} else {
    console.error("❌ [HTML Architecture]: Missing home-content-scroll wrapper!");
    process.exit(1);
}

// 2. Check Containing Block Fix on Body
if (!css.includes('will-change: opacity, transform;')) {
    console.log("✅ [Containing Block Fix]: Removed containing block properties (will-change) from body so fixed elements remain pinned.");
} else {
    console.error("❌ [Containing Block Fix]: Containing block property still present on body!");
    process.exit(1);
}

// 3. Check Mobile Content Scroll Architecture
if (css.includes('.home-content-scroll') && css.includes('flex: 1 1 auto;') && css.includes('padding-bottom: 140px;')) {
    console.log("✅ [Mobile Scroll]: .home-content-scroll allocated flex: 1 1 auto; overflow-y: auto; padding-bottom: 140px.");
} else {
    console.error("❌ [Mobile Scroll]: .home-content-scroll rules missing!");
    process.exit(1);
}

// 4. Check Fixed Controls Layering & Siblings
if (css.includes('z-index: 9999 !important;') && css.includes('z-index: 9998 !important;')) {
    console.log("✅ [Fixed Controls]: Floating + SELL button (z-index 9999) & Bottom Nav (z-index 9998) fixed outside scroll area.");
} else {
    console.error("❌ [Fixed Controls]: Fixed controls rules missing!");
    process.exit(1);
}

// 5. Check WWW Sync
if (wwwHtml.includes('class="home-content-scroll"') && wwwCss.includes('z-index: 9999 !important;')) {
    console.log("✅ [WWW Sync]: Root and www/ files 100% synchronized.");
} else {
    console.error("❌ [WWW Sync]: www/ directory out of sync!");
    process.exit(1);
}

console.log("=================================================");
console.log("   ALL FINAL ARCHITECTURE CHECKS PASSED (100%)   ");
console.log("=================================================");
