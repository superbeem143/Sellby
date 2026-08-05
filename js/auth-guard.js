/* ===================================================== */
/*               SELLBY AUTH-GUARD.JS                    */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : auth-guard.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Authentication Guard
    ✔ Redirect Unauthenticated Users
*/
/* ===================================================== */

import {

    auth

} from "./firebase-config.js";

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href =

            "login.html";

        return;

    }

    document.body.style.visibility =

        "visible";

});
/* ===================================================== */
/*               SELLBY AUTH-GUARD.JS                    */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : auth-guard.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Loading Protection
    ✔ Current User Check
    ✔ Authentication Listener
*/
/* ===================================================== */

document.body.style.visibility =

    "hidden";

window.addEventListener("load", () => {

    const user = auth.currentUser;

    if (user) {

        document.body.style.visibility =

            "visible";

    }

});

auth.onAuthStateChanged((user) => {

    if (user) {

        document.body.style.visibility =

            "visible";

    }

    else {

        window.location.replace(

            "login.html"

        );

    }

});
/* ===================================================== */
/*               SELLBY AUTH-GUARD.JS                    */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : auth-guard.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Session Check
    ✔ Protected Page Ready
    ✔ Authentication Ready
*/
/* ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    auth.onAuthStateChanged((user) => {

        if (user) {

            console.log(

                "Authenticated:",

                user.email

            );

            document.body.classList.add(

                "auth-ready"

            );

        }

        else {

            console.warn(

                "Authentication required."

            );

            window.location.href =

                "login.html";

        }

    });

});