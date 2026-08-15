/* ===================================================== */
/*                  SELLBY POST-AD.JS                    */
/* ===================================================== */

import { auth } from "./firebase-config.js";
import { initTranslations, t } from "./i18n.js";

const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
    card.addEventListener("click", (event) => {
        if (!auth.currentUser) {
            event.preventDefault();
            alert(t('login_first'));
            window.location.href = "login.html";
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    initTranslations();
});

console.log("SELLBY Post Ad Ready");
