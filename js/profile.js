/* ===================================================== */
/*                 SELLBY PROFILE.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : profile.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ DOM Elements
    ✔ Auth State
    ✔ User Details
*/
/* ===================================================== */

import {

    auth,

    signOut

} from "./firebase-config.js";

const userName =

    document.getElementById("userName");

const userEmail =

    document.getElementById("userEmail");

const logoutBtn =

    document.getElementById("logoutBtn");

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    userName.textContent =

        user.displayName ||

        "SELLBY User";

    userEmail.textContent =

        user.email;

});
/* ===================================================== */
/*                 SELLBY PROFILE.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : profile.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Logout
    ✔ Success Handling
    ✔ Error Handling
*/
/* ===================================================== */

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href =

            "login.html";

    }

    catch (error) {

        console.error(error);

        alert(

            "Unable to logout. Please try again."

        );

    }

});
/* ===================================================== */
/*                 SELLBY PROFILE.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : profile.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Refresh User Info
    ✔ Authentication Guard
    ✔ Page Initialization
*/
/* ===================================================== */

window.addEventListener("load", () => {

    auth.onAuthStateChanged((user) => {

        if (!user) {

            window.location.href =

                "login.html";

            return;

        }

        userName.textContent =

            user.displayName ||

            "SELLBY User";

        userEmail.textContent =

            user.email;

    });

});

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        auth.currentUser &&
        (userName.textContent =
            auth.currentUser.displayName ||

            "SELLBY User");

    }

});
