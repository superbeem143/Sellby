/* ===================================================== */
/*                SELLBY REGISTER.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */

import {

    auth,

    createUserWithEmailAndPassword,

    updateProfile

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

function showStatus(message,color="red"){

    statusMessage.textContent = message;

    statusMessage.style.color = color;

}

registerBtn.addEventListener(

    "click",

    async()=>{

        const fullName =
        fullNameInput.value.trim();

        const email =
        emailInput.value.trim().toLowerCase();

        const password =
        passwordInput.value;

        const confirmPassword =
        confirmPasswordInput.value;

        if(

            !fullName ||

            !email ||

            !password ||

            !confirmPassword

        ){

            showStatus(
                "Please fill all fields."
            );

            return;

        }

        if(password!==confirmPassword){

            showStatus(
                "Passwords do not match."
            );

            return;

        }

        if(password.length<6){

            showStatus(
                "Password must be at least 6 characters."
            );

            return;

        }

        registerBtn.disabled=true;

        registerBtn.textContent="Creating...";
/* ===================================================== */
/*                SELLBY REGISTER.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */

        try{

            const userCredential =

                await createUserWithEmailAndPassword(

                    auth,

                    email,

                    password

                );

            await updateProfile(

                userCredential.user,

                {

                    displayName: fullName

                }

            );

            showStatus(

                "Account created successfully!",

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

                case "auth/email-already-in-use":

                    showStatus(

                        "This email is already registered."

                    );

                    break;

                case "auth/invalid-email":

                    showStatus(

                        "Please enter a valid email."

                    );

                    break;

                case "auth/weak-password":

                    showStatus(

                        "Password is too weak."

                    );

                    break;

                default:

                    showStatus(

                        error.message

                    );

            }

            registerBtn.disabled=false;

            registerBtn.textContent=

                "Create Account";

        }
/* ===================================================== */
/*                SELLBY REGISTER.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */

    }

);

fullNameInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            registerBtn.click();

        }

    }

);

emailInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            registerBtn.click();

        }

    }

);

passwordInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            registerBtn.click();

        }

    }

);

confirmPasswordInput.addEventListener(

    "keydown",

    (event)=>{

        if(event.key==="Enter"){

            registerBtn.click();

        }

    }

);                