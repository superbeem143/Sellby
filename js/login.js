/* ===================================================== */
/*                  SELLBY LOGIN.JS                      */
/*            MOBILE NUMBER + OTP AUTHENTICATION         */
/* ===================================================== */

import {
    auth,
    db,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "./firebase-config.js";

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

// Auto-redirect returning users with active session directly to Home page
auth.onAuthStateChanged((user) => {
    if (user) {
        window.location.replace("index.html");
    }
});

// Helper: Status message display
function showStatus(message, type = "error") {
    if (!message) {
        statusMessage.style.display = "none";
        statusMessage.className = "auth-status-msg";
        statusMessage.textContent = "";
        return;
    }
    statusMessage.textContent = message;
    statusMessage.className = `auth-status-msg ${type}`;
    statusMessage.style.display = "block";
}

// Phone Number Normalization to E.164 format
function normalizePhoneNumber(inputVal, selectedCountryCode = "+91") {
    if (!inputVal) return null;
    let clean = inputVal.trim();
    if (!clean) return null;

    const code = selectedCountryCode.startsWith("+") ? selectedCountryCode : `+${selectedCountryCode}`;

    // Case 1: User explicitly typed '+' prefix (e.g., "+919876543210" or "+16505551234")
    if (clean.startsWith("+")) {
        const digits = clean.replace(/\D/g, "");
        if (digits.length >= 10 && digits.length <= 15) {
            return `+${digits}`;
        }
        return null;
    }

    // Extract digits only
    let digits = clean.replace(/\D/g, "");

    // Case 2: 11 digits starting with '0' (e.g., "09876543210") -> strip leading '0'
    if (digits.length === 11 && digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    // Case 3: Standard 10-digit number -> combine with selected country code
    if (digits.length === 10) {
        return `${code}${digits}`;
    }

    // Case 4: Number starts with country code digits e.g. "919876543210" or "16505551234"
    const countryDigits = code.replace(/\D/g, "");
    if (digits.startsWith(countryDigits) && digits.length === (countryDigits.length + 10)) {
        return `+${digits}`;
    }

    // Fallback for non-standard lengths between 10-15
    if (digits.length >= 10 && digits.length <= 15) {
        return `+${digits}`;
    }

    return null;
}

// Initialize & Reset Invisible reCAPTCHA
function getRecaptchaVerifier() {
    if (recaptchaVerifier) {
        try {
            recaptchaVerifier.clear();
        } catch (e) {
            console.warn("reCAPTCHA clear notice:", e);
        }
        recaptchaVerifier = null;
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
            showStatus("reCAPTCHA expired. Please try again.", "error");
            resetSendOtpBtn();
        }
    });

    return recaptchaVerifier;
}

function resetSendOtpBtn() {
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = `<span>Continue</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
}

// Step 1: Request OTP
async function handleSendOtp() {
    showStatus("", "");
    const rawNumber = mobileNumberInput.value.trim();
    const selectedCode = countryCodeInput ? countryCodeInput.value : "+91";

    fullPhoneNumber = normalizePhoneNumber(rawNumber, selectedCode);

    if (!fullPhoneNumber) {
        showStatus("Please enter a valid 10-digit mobile number.", "error");
        mobileNumberInput.focus();
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = `<span class="spinner-icon"></span> Sending OTP...`;

    const isTestNumber = fullPhoneNumber.startsWith("+1650555") || fullPhoneNumber.includes("5551234");
    if (isTestNumber) {
        auth.settings.appVerificationDisabledForTesting = true;
    } else {
        auth.settings.appVerificationDisabledForTesting = false;
    }

    try {
        const verifier = getRecaptchaVerifier();
        await verifier.render();

        confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);

        phoneStep.classList.add("hidden");
        otpStep.classList.remove("hidden");
        displayPhoneNumber.textContent = fullPhoneNumber;

        clearOtpFields();
        otpFields[0].focus();

        showStatus(`OTP sent successfully to ${fullPhoneNumber}`, "info");
        startCountdown(30);
        listenForWebOTP();

    } catch (error) {
        console.error("Firebase Phone Auth Error:", error);
        resetSendOtpBtn();

        // Reset reCAPTCHA on failure so user can retry
        if (recaptchaVerifier) {
            try {
                recaptchaVerifier.render().then(widgetId => {
                    if (typeof grecaptcha !== 'undefined') grecaptcha.reset(widgetId);
                }).catch(() => {});
            } catch(e) {}
        }

        switch (error.code) {
            case "auth/invalid-phone-number":
                showStatus("Invalid mobile number format. Please check the number and country code.", "error");
                break;
            case "auth/too-many-requests":
                showStatus("Too many requests from this device. Please try again later.", "error");
                break;
            case "auth/quota-exceeded":
                showStatus("SMS quota exceeded for this Firebase project. Please try again later.", "error");
                break;
            case "auth/billing-not-enabled":
                showStatus("SMS service error (billing not enabled on Firebase project). Please contact support.", "error");
                break;
            case "auth/operation-not-allowed":
                showStatus(`Phone auth is not allowed (${error.message}). Please ensure Phone provider and domain (${window.location.hostname}) are enabled in Firebase Console.`, "error");
                break;
            case "auth/unauthorized-domain":
                showStatus(`Domain unauthorized (${window.location.hostname}). Please add '${window.location.hostname}' to Firebase Console > Authentication > Settings > Authorized Domains.`, "error");
                break;
            case "auth/captcha-check-failed":
                showStatus("reCAPTCHA verification failed. Please try again.", "error");
                break;
            default:
                showStatus(error.message ? `${error.message}` : "Failed to send OTP. Please check your connection and try again.", "error");
        }
    }
}

// Step 2: Verify OTP
async function verifyOtp() {
    if (isVerifying || !confirmationResult) return;

    showStatus("", "");
    const otpCode = getOtpValue();

    if (otpCode.length !== 6) {
        showStatus("Please enter the complete 6-digit verification code.", "error");
        return;
    }

    isVerifying = true;
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = `<span class="spinner-icon"></span> Verifying...`;
    disableOtpFields(true);

    try {
        const userCredential = await confirmationResult.confirm(otpCode);
        const user = userCredential.user;

        showStatus("OTP verified! Logging in...", "success");

        // Non-blocking background sync of user profile in Firestore
        (async () => {
            try {
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
            } catch (e) {
                console.warn("Firestore profile background sync notice:", e);
            }
        })();

        // Immediate redirect to Home page
        window.location.replace("index.html");

    } catch (error) {
        console.error("OTP Verification Error:", error);
        isVerifying = false;
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.innerHTML = `<span>Verify Code</span>`;
        disableOtpFields(false);

        switch (error.code) {
            case "auth/invalid-verification-code":
                showStatus("Invalid verification code. Please check and try again.", "error");
                break;
            case "auth/code-expired":
                showStatus("Verification code has expired. Please click 'Resend OTP'.", "error");
                break;
            case "auth/session-expired":
                showStatus("Verification session expired. Please request a new OTP.", "error");
                break;
            case "auth/too-many-requests":
                showStatus("Too many verification attempts. Please try again later.", "error");
                break;
            default:
                showStatus(error.message || "Verification failed. Please try again.", "error");
        }
    } finally {
        // Safety cleanup if redirect is delayed
        setTimeout(() => {
            if (isVerifying && !auth.currentUser) {
                isVerifying = false;
                verifyOtpBtn.disabled = false;
                verifyOtpBtn.innerHTML = `<span>Verify Code</span>`;
                disableOtpFields(false);
            }
        }, 3500);
    }
}

// 6-Digit OTP Field Utilities
function getOtpValue() {
    return otpFields.map(field => field.value.trim()).join("");
}

function clearOtpFields() {
    otpFields.forEach(field => {
        field.value = "";
        field.classList.remove("filled");
    });
}

function disableOtpFields(disabled) {
    otpFields.forEach(field => {
        field.disabled = disabled;
    });
}

function fillOtpFields(code) {
    const digits = code.toString().replace(/\D/g, "").slice(0, 6).split("");
    digits.forEach((digit, idx) => {
        if (otpFields[idx]) {
            otpFields[idx].value = digit;
            otpFields[idx].classList.add("filled");
        }
    });
    if (digits.length > 0) {
        const lastIdx = Math.min(digits.length - 1, 5);
        otpFields[lastIdx].focus();
    }
}

// Auto-advance & OTP Auto-Verification Logic
otpFields.forEach((field, index) => {
    field.addEventListener("input", () => {
        const val = field.value;

        // If user pasted or auto-filled multiple digits into a single box
        if (val.length > 1) {
            fillOtpFields(val);
            if (getOtpValue().length === 6) {
                verifyOtp();
            }
            return;
        }

        if (val) {
            field.classList.add("filled");
            if (index < 5) {
                otpFields[index + 1].focus();
            }
        } else {
            field.classList.remove("filled");
        }

        // Auto verify when 6th digit is typed/detected
        if (getOtpValue().length === 6 && !isVerifying) {
            verifyOtp();
        }
    });

    field.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
            if (!field.value && index > 0) {
                otpFields[index - 1].focus();
                otpFields[index - 1].value = "";
                otpFields[index - 1].classList.remove("filled");
            } else {
                field.value = "";
                field.classList.remove("filled");
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            otpFields[index - 1].focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            otpFields[index + 1].focus();
        }
    });

    field.addEventListener("paste", (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData("text");
        fillOtpFields(pastedData);
        if (getOtpValue().length === 6 && !isVerifying) {
            verifyOtp();
        }
    });
});

// WebOTP API: Automatic Android SMS OTP reading
function listenForWebOTP() {
    if ('OTPCredential' in window) {
        const ac = new AbortController();
        navigator.credentials.get({
            otp: { transport: ['sms'] },
            signal: ac.signal
        }).then(otp => {
            if (otp && otp.code) {
                const codeDigits = otp.code.replace(/\D/g, '').slice(0, 6);
                if (codeDigits.length === 6) {
                    fillOtpFields(codeDigits);
                    verifyOtp();
                }
            }
        }).catch(err => {
            console.log("WebOTP notice:", err.message || err);
        });
    }
}

// Resend Countdown Timer (30 seconds)
function startCountdown(seconds = 30) {
    if (countdownInterval) clearInterval(countdownInterval);

    resendOtpBtn.disabled = true;
    timerCountdown.style.display = "inline";

    let remaining = seconds;
    timerCountdown.innerHTML = `in <strong>${remaining}s</strong>`;

    countdownInterval = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            resendOtpBtn.disabled = false;
            timerCountdown.style.display = "none";
        } else {
            timerCountdown.innerHTML = `in <strong>${remaining}s</strong>`;
        }
    }, 1000);
}

// Event Listeners
sendOtpBtn.addEventListener("click", sendOtp);

mobileNumberInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendOtp();
    }
});

verifyOtpBtn.addEventListener("click", verifyOtp);

resendOtpBtn.addEventListener("click", async () => {
    if (resendOtpBtn.disabled) return;
    showStatus("Resending verification code...", "info");
    await sendOtp();
});

changeNumberBtn.addEventListener("click", () => {
    if (countdownInterval) clearInterval(countdownInterval);
    otpStep.classList.add("hidden");
    phoneStep.classList.remove("hidden");
    resetSendOtpBtn();
    clearOtpFields();
    showStatus("", "");
    mobileNumberInput.focus();
});