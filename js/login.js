/* ===================================================== */
/*                  SELLBY LOGIN.JS                      */
/*                MOBILE OTP LOGIN                      */
/* ===================================================== */

import {
    auth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "./firebase-config.js";


/* ================= ELEMENTS ================= */

const phoneNumberInput =
    document.getElementById("phoneNumber");

const otpCodeInput =
    document.getElementById("otpCode");

const sendOtpBtn =
    document.getElementById("sendOtpBtn");

const verifyOtpBtn =
    document.getElementById("verifyOtpBtn");

const backBtn =
    document.getElementById("backBtn");

const phoneLoginSection =
    document.getElementById("phoneLoginSection");

const otpSection =
    document.getElementById("otpSection");

const statusMessage =
    document.getElementById("statusMessage");


/* ================= VARIABLES ================= */

let confirmationResult = null;
let recaptchaVerifier = null;


/* ================= STATUS ================= */

function showStatus(message, color = "red") {

    statusMessage.textContent = message;
    statusMessage.style.color = color;

}


/* ================= PHONE FORMAT ================= */

function getPhoneNumber() {

    let phone =
        phoneNumberInput.value.trim();

    phone = phone.replace(/\s+/g, "");

    if (phone.startsWith("0")) {

        phone = "+91" + phone.substring(1);

    }

    if (!phone.startsWith("+")) {

        phone = "+91" + phone;

    }

    return phone;

}


/* ================= RECAPTCHA ================= */

function setupRecaptcha() {

    if (recaptchaVerifier) {
        return;
    }

    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "normal"
            }
        );

}


/* ================= SEND OTP ================= */

sendOtpBtn.addEventListener(

    "click",

    async () => {

        const phoneNumber =
            getPhoneNumber();

        if (!phoneNumber) {

            showStatus(
                "Please enter your mobile number."
            );

            return;
        }


        if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {

            showStatus(
                "Please enter a valid mobile number."
            );

            return;
        }


        sendOtpBtn.disabled = true;

        sendOtpBtn.textContent =
            "Sending OTP...";


        try {

            setupRecaptcha();


            confirmationResult =
                await signInWithPhoneNumber(
                    auth,
                    phoneNumber,
                    recaptchaVerifier
                );


            phoneLoginSection.style.display =
                "none";

            otpSection.style.display =
                "block";


            showStatus(
                "OTP sent successfully.",
                "green"
            );


            otpCodeInput.focus();


        } catch (error) {

            console.error(error);

            showStatus(
                getAuthErrorMessage(error)
            );


            sendOtpBtn.disabled = false;

            sendOtpBtn.textContent =
                "Continue";


            if (recaptchaVerifier) {

                try {

                    recaptchaVerifier.clear();

                } catch (e) {

                    console.warn(e);

                }

                recaptchaVerifier =
                    null;

            }

        }

    }

);


/* ================= VERIFY OTP ================= */

async function verifyOtp() {

    const otp =
        otpCodeInput.value.trim();


    if (!/^\d{6}$/.test(otp)) {

        showStatus(
            "Please enter the 6-digit OTP."
        );

        return;
    }


    if (!confirmationResult) {

        showStatus(
            "Please request a new OTP."
        );

        return;
    }


    verifyOtpBtn.disabled = true;

    verifyOtpBtn.textContent =
        "Verifying...";


    try {

        await confirmationResult.confirm(
            otp
        );


        showStatus(
            "Login successful!",
            "green"
        );


        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 500);


    } catch (error) {

        console.error(error);

        showStatus(
            getAuthErrorMessage(error)
        );


        verifyOtpBtn.disabled = false;

        verifyOtpBtn.textContent =
            "Verify & Continue";

    }

}


/* ================= VERIFY BUTTON ================= */

verifyOtpBtn.addEventListener(
    "click",
    verifyOtp
);


/* ================= AUTO OTP ================= */

otpCodeInput.addEventListener(

    "input",

    () => {

        otpCodeInput.value =
            otpCodeInput.value
                .replace(/\D/g, "")
                .slice(0, 6);


        if (
            otpCodeInput.value.length === 6
        ) {

            verifyOtp();

        }

    }

);


/* ================= CHANGE NUMBER ================= */

backBtn.addEventListener(

    "click",

    () => {

        otpSection.style.display =
            "none";

        phoneLoginSection.style.display =
            "block";

        otpCodeInput.value =
            "";

        confirmationResult =
            null;

        showStatus("");


        if (recaptchaVerifier) {

            try {

                recaptchaVerifier.clear();

            } catch (e) {

                console.warn(e);

            }

            recaptchaVerifier =
                null;

        }

    }

);


/* ================= ERROR HANDLER ================= */

function getAuthErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-phone-number":
            return "Please enter a valid mobile number.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/invalid-verification-code":
            return "Incorrect OTP. Please try again.";

        case "auth/code-expired":
            return "OTP expired. Please request a new OTP.";

        case "auth/quota-exceeded":
            return "OTP limit reached. Please try again later.";

        case "auth/billing-not-enabled":
            return "Phone OTP SMS requires Firebase billing to be enabled.";

        case "auth/operation-not-allowed":
            return "Phone login is not enabled in Firebase.";

        case "auth/captcha-check-failed":
            return "Security verification failed. Please try again.";

        default:
            return error.message ||
                "Something went wrong. Please try again.";

    }

}
