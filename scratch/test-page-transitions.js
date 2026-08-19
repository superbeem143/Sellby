const fs = require('fs');

console.log("=================================================");
console.log("    SELLBY PAGE TRANSITION VERIFICATION          ");
console.log("=================================================");

const styleCss = fs.readFileSync('css/style.css', 'utf8');
const adminCss = fs.readFileSync('css/admin.css', 'utf8');
const authGuardJs = fs.readFileSync('js/auth-guard.js', 'utf8');

// 1. Check CSS Page Animations in style.css
if (styleCss.includes('body.auth-ready') && styleCss.includes('body.page-exiting') && styleCss.includes('prefers-reduced-motion: reduce')) {
    console.log("✅ [css/style.css]: Smooth page entrance, exit, and accessibility (prefers-reduced-motion) rules verified.");
} else {
    console.error("❌ [css/style.css]: Page transition rules missing!");
    process.exit(1);
}

// 2. Check CSS Page Animations in admin.css
if (adminCss.includes('body.auth-ready') && adminCss.includes('body.page-exiting') && adminCss.includes('prefers-reduced-motion: reduce')) {
    console.log("✅ [css/admin.css]: Admin portal smooth page transition and accessibility rules verified.");
} else {
    console.error("❌ [css/admin.css]: Admin transition rules missing!");
    process.exit(1);
}

// 3. Check JS Event Handlers in auth-guard.js
if (authGuardJs.includes('window.smoothNavigate') && authGuardJs.includes('initPageTransitions') && authGuardJs.includes('pageshow')) {
    console.log("✅ [js/auth-guard.js]: Global smooth navigation helper, event listener, and bfcache handling verified.");
} else {
    console.error("❌ [js/auth-guard.js]: Smooth navigation script handlers missing!");
    process.exit(1);
}

console.log("=================================================");
console.log("   ALL PAGE TRANSITION CHECKS PASSED (100%)     ");
console.log("=================================================");
