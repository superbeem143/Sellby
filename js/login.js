/* ===================================================== */
/*                  SELLBY LOGIN.JS                      */
/*                     JS PART 1                         */
/* ===================================================== */

import {

    auth,

    signInWithEmailAndPassword

} from "./firebase-config.js";

const emailInput =
document.getElementById("email");

const passwordInput =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const statusMessage =
document.getElementById("statusMessage");

function showStatus(message,color="red"){

    statusMessage.textContent = message;

    statusMessage.style.color = color;

}

loginBtn.addEventListener(

    "click",

    async()=>{

        const email =
        emailInput.value.trim().toLowerCase();

        const password =
        passwordInput.value;

        if(!email || !password){

            showStatus(

                "Please enter email and password."

            );

            return;

        }

        loginBtn.disabled = true;

        loginBtn.textContent =

            "Logging in...";
/* ===================================================== */
/*                  SELLBY LOGIN.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */

        try{

            await signInWithEmailAndPassword(

                auth,

                email,

                password

            );

            showStatus(

                "Login successful!",

                "green"

            );

            setTimeout(()=>{

                window.location.href =

                    "index.html";

            },1000);

        }

        catch(error){

            console.error(error);

            switch(error.code){

                case "auth/invalid-credential":

                    showStatus(

                        "Invalid email or password."

                    );

                    break;

                case "auth/user-not-found":

                    showStatus(

                        "Account not found."

                    );

                    break;

                case "auth/wrong-password":

                    showStatus(

                        "Incorrect password."

                    );

                    break;

                case "auth/invalid-email":

                    showStatus(

                        "Invalid email address."

                    );

                    break;

                default:

                    showStatus(

                        error.message

                    );

            }

            loginBtn.disabled = false;

            loginBtn.textContent =

                "Login";

        }

    }

);
/* ===================================================== */
/*                  SELLBY LOGIN.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */

emailInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            loginBtn.click();

        }

    }

);

passwordInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            loginBtn.click();

        }

    }

);            