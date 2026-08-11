/* ===================================================== */
/*               SELLBY AUTH-GUARD.JS                    */
/* ===================================================== */

import { auth } from "./firebase-config.js";

// Prevent unauthenticated UI flicker
document.body.style.visibility = "hidden";

auth.onAuthStateChanged((user) => {
    if (user) {
        document.body.style.visibility = "visible";
        document.body.classList.add("auth-ready");
    } else {
        window.location.replace("login.html");
    }
});