/* ===================================================== */
/*                  SELLBY LOGIN.JS                      */
/* ===================================================== */

import {
    auth,
    db,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    getDoc,
    doc,
    setDoc,
    serverTimestamp
} from "./firebase-config.js";
import { getTranslations, t, initTranslations } from "./i18n.js";

// DOM Elements
const phoneStep = document.getElementById("phoneStep");
const otpStep = document.getElementById("otpStep");
const countryCodeInput = document.getElementById("countryCode");
const mobileNumberInput = document.getElementById("mobileNumber");
const sendOtpBtn = document.getElementById("sendOtpBtn");

const displayPhoneNumber = document.getElementById("displayPhoneNumber");
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
const timerCountdown = document.getElementById("timerCountdown");
const statusMessage = document.getElementById("statusMessage");

// Global State
let confirmationResult = null;
let recaptchaVerifier = null;
let countdownInterval = null;
let fullPhoneNumber = "";
let isVerifying = false;

// Auto-redirect
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.replace("index.html");
    }
});

function showStatus(message, type = "error") {
    if (!message) {
        statusMessage.style.display = "none";
        statusMessage.className = "auth-status-msg";
        return;
    }
    statusMessage.textContent = message;
    statusMessage.className = `auth-status-msg ${type}`;
    statusMessage.style.display = "block";
}

function normalizePhoneNumber(inputVal, selectedCountryCode = "+91") {
    if (!inputVal) return null;
    let clean = inputVal.trim();
    const code = selectedCountryCode.startsWith("+") ? selectedCountryCode : `+${selectedCountryCode}`;
    if (clean.startsWith("+")) {
        const digits = clean.replace(/\D/g, "");
        if (digits.length >= 10) return `+${digits}`;
        return null;
    }
    let digits = clean.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) return `${code}${digits}`;
    return digits.length >= 10 ? `+${digits}` : null;
}

function getRecaptchaVerifier() {
    if (recaptchaVerifier) {
        try { recaptchaVerifier.clear(); } catch (e) {}
        recaptchaVerifier = null;
    }
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
            showStatus(t('failed'), "error");
            resetSendOtpBtn();
        }
    });
    return recaptchaVerifier;
}

function resetSendOtpBtn() {
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = `<span>Continue</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
}

async function handleSendOtp() {
    showStatus("", "");
    const rawNumber = mobileNumberInput.value.trim();
    const selectedCode = countryCodeInput ? countryCodeInput.value : "+91";
    fullPhoneNumber = normalizePhoneNumber(rawNumber, selectedCode);

    if (!fullPhoneNumber) {
        showStatus("Invalid phone number.", "error");
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = `<span class="spinner-icon"></span> Sending...`;

    try {
        const verifier = getRecaptchaVerifier();
        await verifier.render();
        confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
        phoneStep.classList.add("hidden");
        otpStep.classList.remove("hidden");
        displayPhoneNumber.textContent = fullPhoneNumber;
        otpFields[0].focus();
        startCountdown(30);
    } catch (error) {
        console.error(error);
        resetSendOtpBtn();
        showStatus(error.message || t('failed'), "error");
    }
}

async function verifyOtp() {
    if (isVerifying || !confirmationResult) return;
    const otpCode = otpFields.map(f => f.value.trim()).join("");
    if (otpCode.length !== 6) return;

    isVerifying = true;
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = `<span class="spinner-icon"></span> Verifying...`;

    try {
        const userCredential = await confirmationResult.confirm(otpCode);
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                phoneNumber: user.phoneNumber || fullPhoneNumber,
                displayName: user.displayName || `User ${fullPhoneNumber.slice(-4)}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
        window.location.replace("index.html");
    } catch (error) {
        console.error(error);
        isVerifying = false;
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.innerHTML = `<span>Verify</span>`;
        showStatus(error.message || "Failed.", "error");
    }
}

function startCountdown(seconds = 30) {
    if (countdownInterval) clearInterval(countdownInterval);
    resendOtpBtn.disabled = true;
    let remaining = seconds;
    countdownInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            resendOtpBtn.disabled = false;
            timerCountdown.style.display = "none";
        } else {
            timerCountdown.innerHTML = `in ${remaining}s`;
        }
    }, 1000);
}

otpFields.forEach((field, index) => {
    field.addEventListener("input", () => {
        if (field.value && index < 5) otpFields[index + 1].focus();
        if (otpFields.every(f => f.value.length === 1)) verifyOtp();
    });
    field.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !field.value && index > 0) otpFields[index - 1].focus();
    });
});

sendOtpBtn.addEventListener("click", handleSendOtp);
verifyOtpBtn.addEventListener("click", verifyOtp);
resendOtpBtn.addEventListener("click", handleSendOtp);
changeNumberBtn.addEventListener("click", () => {
    otpStep.classList.add("hidden");
    phoneStep.classList.remove("hidden");
    resetSendOtpBtn();
});

document.addEventListener("DOMContentLoaded", () => {
    initTranslations();
});
