/* ===================================================== */
/*                  SELLBY POST-AD.JS                    */
/* ===================================================== */

import { auth } from "./firebase-config.js";

const cards = document.querySelectorAll(".card");

cards.forEach((card) => {

    card.addEventListener("click", (event) => {

        if (!auth.currentUser) {

            event.preventDefault();

            alert("Please login first.");

            window.location.href = "login.html";

        }

    });

});

console.log("SELLBY Post Ad Ready");
