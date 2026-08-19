import fs from 'fs';
import path from 'path';

console.log("=== VERIFYING HOME SCROLL FIX (UPDATED PROMPT REQUIREMENTS) ===");

const indexPath = path.resolve('index.html');
const cssPath = path.resolve('css/style.css');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const cssText = fs.readFileSync(cssPath, 'utf-8');

// Check 1: HTML structure
const mainScrollMatch = indexHtml.includes('<main class="home-scroll-area">') && indexHtml.includes('</main>');
console.log("Check 1 - main.home-scroll-area container exists:", mainScrollMatch);

const searchInsideScroll = indexHtml.indexOf('<main class="home-scroll-area">') < indexHtml.indexOf('<section class="search-section">') &&
    indexHtml.indexOf('<section class="search-section">') < indexHtml.indexOf('</main>');
console.log("Check 2 - search-section inside home-scroll-area:", searchInsideScroll);

const heroInsideScroll = indexHtml.indexOf('<main class="home-scroll-area">') < indexHtml.indexOf('<section class="hero">') &&
    indexHtml.indexOf('<section class="hero">') < indexHtml.indexOf('</main>');
console.log("Check 3 - hero section inside home-scroll-area:", heroInsideScroll);

const categoriesInsideScroll = indexHtml.indexOf('<main class="home-scroll-area">') < indexHtml.indexOf('<section class="categories">') &&
    indexHtml.indexOf('<section class="categories">') < indexHtml.indexOf('</main>');
console.log("Check 4 - categories section inside home-scroll-area:", categoriesInsideScroll);

const latestAdsInsideScroll = indexHtml.indexOf('<main class="home-scroll-area">') < indexHtml.indexOf('<section class="latest-ads">') &&
    indexHtml.indexOf('<section class="latest-ads">') < indexHtml.indexOf('</main>');
console.log("Check 5 - latest-ads section inside home-scroll-area:", latestAdsInsideScroll);

// Order check inside container: Search -> Hero -> Categories -> Latest Ads
const orderCheck = indexHtml.indexOf('<section class="search-section">') < indexHtml.indexOf('<section class="hero">') &&
    indexHtml.indexOf('<section class="hero">') < indexHtml.indexOf('<section class="categories">') &&
    indexHtml.indexOf('<section class="categories">') < indexHtml.indexOf('<section class="latest-ads">');
console.log("Check 6 - Order inside scroll container (Search -> Hero -> Categories -> Latest Ads):", orderCheck);

// Fixed top header outside container
const headerBeforeScroll = indexHtml.indexOf('class="header"') < indexHtml.indexOf('<main class="home-scroll-area">');
console.log("Check 7 - Top Header fixed above home-scroll-area:", headerBeforeScroll);

// Bottom Nav & + SELL outside container
const bottomNavAfterScroll = indexHtml.indexOf('class="bottom-nav"') > indexHtml.indexOf('</main>');
const sellBtnAfterScroll = indexHtml.indexOf('class="floating-post-btn"') > indexHtml.indexOf('</main>');
console.log("Check 8 - Bottom Nav and + SELL button outside home-scroll-area:", bottomNavAfterScroll && sellBtnAfterScroll);

// Check 2: CSS rules
const hasHomePageCss = cssText.includes('body.home-page .home-scroll-area');
console.log("Check 9 - body.home-page .home-scroll-area CSS present:", hasHomePageCss);

const hasFlexShrinkHeader = cssText.includes('body.home-page .header') && cssText.includes('flex-shrink: 0;');
console.log("Check 10 - Header flex-shrink: 0 present:", hasFlexShrinkHeader);

const searchNotFlexShrink = !cssText.includes('body.home-page .search-section');
const heroNotFlexShrink = !cssText.includes('body.home-page .hero');
console.log("Check 11 - Search and Hero allowed to scroll together:", searchNotFlexShrink && heroNotFlexShrink);

const noGlobalOverflowHidden = !cssText.includes('\nbody {\n    overflow: hidden;') && !cssText.includes('\nhtml {\n    overflow: hidden;');
console.log("Check 12 - No global overflow:hidden:", noGlobalOverflowHidden);

const noGlobal100dvh = !cssText.includes('\nbody {\n    height: 100dvh;') && !cssText.includes('\nhtml {\n    height: 100dvh;');
console.log("Check 13 - No global height:100dvh:", noGlobal100dvh);

// Bottom Nav & Floating post CSS intact
const bottomNavCssIntact = cssText.includes('.bottom-nav {') && cssText.includes('position: fixed;');
const floatingPostCssIntact = cssText.includes('.floating-post-btn {') && cssText.includes('position: fixed;');
console.log("Check 14 - Bottom nav CSS fixed position intact:", bottomNavCssIntact);
console.log("Check 15 - Floating + SELL button CSS fixed position intact:", floatingPostCssIntact);

if (mainScrollMatch && searchInsideScroll && heroInsideScroll && categoriesInsideScroll && latestAdsInsideScroll &&
    orderCheck && headerBeforeScroll && bottomNavAfterScroll && sellBtnAfterScroll && hasHomePageCss &&
    hasFlexShrinkHeader && searchNotFlexShrink && heroNotFlexShrink && noGlobalOverflowHidden && noGlobal100dvh &&
    bottomNavCssIntact && floatingPostCssIntact) {
    console.log("\n>>> ALL 15 CHECKS PASSED SUCCESSFULLY! <<<");
} else {
    console.error("\n>>> VERIFICATION FAILED! <<<");
    process.exit(1);
}
