/* ===================================================== */
/*               SELLBY AUTH-GUARD.JS                    */
/* ===================================================== */

import { auth } from "./firebase-config.js";
import { initTranslations } from "./i18n.js";

// Prevent unauthenticated UI flicker
document.body.style.visibility = "hidden";

auth.onAuthStateChanged((user) => {
    if (user) {
        initTranslations();
        document.body.style.visibility = "visible";
        document.body.classList.add("auth-ready");
    } else {
        // Only redirect if NOT on an auth page
        const path = window.location.pathname;
        if (path.includes("login.html") || path.includes("register.html") || path.includes("forgot-password.html")) {
            initTranslations();
            document.body.style.visibility = "visible";
        } else {
            window.location.replace("login.html");
        }
    }
});
