/* ===================================================== */
/*            SELLBY FORGOT-PASSWORD.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : forgot-password.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ DOM Elements
    ✔ Reset Button
    ✔ Status Message
*/
/* ===================================================== */

import {

    auth,

    sendPasswordResetEmail

} from "./firebase-config.js";

const emailInput =

    document.getElementById("email");

const resetBtn =

    document.getElementById("resetBtn");

const statusMessage =

    document.getElementById("statusMessage");

resetBtn.addEventListener("click", async () => {

    const email =

        emailInput.value.trim();

    if (!email) {

        statusMessage.textContent =

            "Please enter your email address.";

        return;

    }

    resetBtn.disabled = true;

    resetBtn.textContent =

        "Sending Reset Link...";
/* ===================================================== */
/*            SELLBY FORGOT-PASSWORD.JS                  */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : forgot-password.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Send Password Reset Email
    ✔ Success Handling
    ✔ Error Handling
*/
/* ===================================================== */

    try {

        await sendPasswordResetEmail(

            auth,

            email

        );

        statusMessage.textContent =

            "Password reset link has been sent to your email.";

    }

    catch (error) {

        console.error(error);

        statusMessage.textContent =

            error.message;

    }

    finally {

        resetBtn.disabled = false;

        resetBtn.textContent =

            "Send Reset Link";

    }

});
/* ===================================================== */
/*            SELLBY FORGOT-PASSWORD.JS                  */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : forgot-password.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Enter Key Support
    ✔ Email Validation
    ✔ Auto Focus
*/
/* ===================================================== */

emailInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        resetBtn.click();

    }

});

window.addEventListener("load", () => {

    emailInput.focus();

});

emailInput.addEventListener("input", () => {

    statusMessage.textContent = "";

});        