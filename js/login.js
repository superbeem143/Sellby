/* =====================================================
   SELLBY LOGIN.JS
   Firebase Phone OTP Authentication
   ===================================================== */

import {
    auth,
    db,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    onAuthStateChanged,
    getDoc,
    doc,
    setDoc,
    serverTimestamp
} from "./firebase-config.js";

import { t, initTranslations } from "./i18n.js";

/* =====================================================
   DOM
   ===================================================== */

const phoneStep = document.getElementById("phoneStep");
const otpStep = document.getElementById("otpStep");

const countryCodeInput = document.getElementById("countryCode");
const mobileNumberInput = document.getElementById("mobileNumber");
const sendOtpBtn = document.getElementById("sendOtpBtn");

const displayPhoneNumber =
    document.getElementById("displayPhoneNumber");

const otpFields = [
    document.getElementById("otp-1"),
    document.getElementById("otp-2"),
    document.getElementById("otp-3"),
    document.getElementById("otp-4"),
    document.getElementById("otp-5"),
    document.getElementById("otp-6")
];

const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const changeNumberBtn = document.getElementById("changeNumberBtn");

const timerCountdown =
    document.getElementById("timerCountdown");

const statusMessage =
    document.getElementById("statusMessage");

/* =====================================================
   STATE
   ===================================================== */

let confirmationResult = null;
let recaptchaVerifier = null;
let countdownInterval = null;
let fullPhoneNumber = "";
let isVerifying = false;
let isSendingOtp = false;

/* =====================================================
   AUTH STATE
   ===================================================== */

onAuthStateChanged(auth, (user) => {

    if (user) {
        console.log("SELLBY: User already signed in.");

        // Do not redirect while OTP verification UI is active.
        if (!confirmationResult) {
            window.location.replace("index.html");
        }
    }

});

/* =====================================================
   STATUS
   ===================================================== */

function showStatus(message = "", type = "") {

    if (!statusMessage) return;

    if (!message) {
        statusMessage.textContent = "";
        statusMessage.className = "auth-status-msg";
        statusMessage.style.display = "none";
        return;
    }

    statusMessage.textContent = message;
    statusMessage.className =
        `auth-status-msg ${type}`;

    statusMessage.style.display = "block";
}

/* =====================================================
   PHONE NORMALIZATION
   ===================================================== */

function normalizePhoneNumber(
    inputValue,
    selectedCountryCode = "+91"
) {

    if (!inputValue) return null;

    let value = inputValue.trim();

    const countryCode =
        selectedCountryCode.startsWith("+")
            ? selectedCountryCode
            : `+${selectedCountryCode}`;

    // User entered complete international number.
    if (value.startsWith("+")) {

        const digits =
            value.replace(/\D/g, "");

        if (digits.length >= 10) {
            return `+${digits}`;
        }

        return null;
    }

    let digits =
        value.replace(/\D/g, "");

    // Remove leading zero.
    if (
        digits.length === 11 &&
        digits.startsWith("0")
    ) {
        digits = digits.substring(1);
    }

    // Standard Indian mobile number.
    if (
        countryCode === "+91" &&
        digits.length === 10
    ) {
        return `${countryCode}${digits}`;
    }

    // Generic international number.
    if (digits.length >= 9) {
        return `${countryCode}${digits}`;
    }

    return null;
}

/* =====================================================
   RECAPTCHA
   ===================================================== */

function destroyRecaptcha() {

    if (!recaptchaVerifier) return;

    try {
        recaptchaVerifier.clear();
    } catch (error)
