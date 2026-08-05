/* ===================================================== */
/*                SELLBY REGISTER.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : register.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ DOM Elements
    ✔ Register Button
    ✔ Status Message
*/
/* ===================================================== */

import {

    auth,

    createUserWithEmailAndPassword

} from "./firebase-config.js";

const fullNameInput =

    document.getElementById("fullName");

const emailInput =

    document.getElementById("email");

const passwordInput =

    document.getElementById("password");

const confirmPasswordInput =

    document.getElementById("confirmPassword");

const registerBtn =

    document.getElementById("registerBtn");

const statusMessage =

    document.getElementById("statusMessage");

registerBtn.addEventListener("click", async () => {

    const fullName =

        fullNameInput.value.trim();

    const email =

        emailInput.value.trim();

    const password =

        passwordInput.value;

    const confirmPassword =

        confirmPasswordInput.value;

    if (

        !fullName ||

        !email ||

        !password ||

        !confirmPassword

    ) {

        statusMessage.textContent =

            "Please fill in all fields.";

        return;

    }

    if (password !== confirmPassword) {

        statusMessage.textContent =

            "Passwords do not match.";

        return;

    }

    registerBtn.disabled = true;

    registerBtn.textContent =

        "Creating Account...";
/* ===================================================== */
/*                SELLBY REGISTER.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : register.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Firebase Registration
    ✔ Success Handling
    ✔ Error Handling
*/
/* ===================================================== */

    try {

        await createUserWithEmailAndPassword(

            auth,

            email,

            password

        );

        statusMessage.textContent =

            "Account Created Successfully!";

        window.location.href =

            "index.html";

    }

    catch (error) {

        console.error(error);

        statusMessage.textContent =

            error.message;

        registerBtn.disabled = false;

        registerBtn.textContent =

            "Create Account";

    }

});
/* ===================================================== */
/*                SELLBY REGISTER.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : register.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Enter Key Register
    ✔ Auto Redirect
    ✔ Auth State Check
*/
/* ===================================================== */

fullNameInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        registerBtn.click();

    }

});

emailInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        registerBtn.click();

    }

});

passwordInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        registerBtn.click();

    }

});

confirmPasswordInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        registerBtn.click();

    }

});

auth.onAuthStateChanged((user) => {

    if (user) {

        window.location.href = "index.html";

    }

});        