/* =====================================================
   SELLBY LOGIN.JS
   Firebase Phone OTP Authentication
   ===================================================== */

import {
    auth,
    db,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    getDoc,
    doc,
    setDoc,
    serverTimestamp
} from "./firebase-config.js";

import { initTranslations } from "./i18n.js";


/* =====================================================
   DOM
   ===================================================== */

const phoneStep = document.getElementById("phoneStep");
const otpStep = document.getElementById("otpStep");
const emailStep = document.getElementById("emailStep");

const switchToEmailBtn = document.getElementById("switchToEmailBtn");
const switchToPhoneBtn = document.getElementById("switchToPhoneBtn");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const emailLoginBtn = document.getElementById("emailLoginBtn");

const countryCodeInput =
    document.getElementById("countryCode");

const mobileNumberInput =
    document.getElementById("mobileNumber");

const sendOtpBtn =
    document.getElementById("sendOtpBtn");

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

const verifyOtpBtn =
    document.getElementById("verifyOtpBtn");

const resendOtpBtn =
    document.getElementById("resendOtpBtn");

const changeNumberBtn =
    document.getElementById("changeNumberBtn");

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
let webOtpAbortController = null;


/* =====================================================
   AUTH STATE
   ===================================================== */

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "SELLBY: User already signed in."
        );

        if (!confirmationResult) {
            window.location.replace("index.html");
        }
    }

});


/* =====================================================
   TRANSLATIONS
   ===================================================== */

try {
    initTranslations();
} catch (error) {
    console.warn(
        "SELLBY translation initialization notice:",
        error
    );
}


/* =====================================================
   STATUS
   ===================================================== */

function showStatus(
    message = "",
    type = ""
) {

    if (!statusMessage) return;

    if (!message) {

        statusMessage.textContent = "";
        statusMessage.className =
            "auth-status-msg";

        statusMessage.style.display =
            "none";

        return;
    }

    statusMessage.textContent =
        message;

    statusMessage.className =
        `auth-status-msg ${type}`;

    statusMessage.style.display =
        "block";
}


/* =====================================================
   PHONE NORMALIZATION
   ===================================================== */

function normalizePhoneNumber(
    inputValue,
    selectedCountryCode = "+91"
) {

    if (!inputValue) return null;

    let value =
        inputValue.trim();

    if (!value) return null;

    const countryCode =
        selectedCountryCode.startsWith("+")
            ? selectedCountryCode
            : `+${selectedCountryCode}`;


    /* Full international number */

    if (value.startsWith("+")) {

        const digits =
            value.replace(/\D/g, "");

        if (
            digits.length >= 10 &&
            digits.length <= 15
        ) {
            return `+${digits}`;
        }

        return null;
    }


    /* Digits only */

    let digits =
        value.replace(/\D/g, "");


    /* Remove leading zero */

    if (
        digits.length === 11 &&
        digits.startsWith("0")
    ) {
        digits =
            digits.substring(1);
    }


    /* Standard 10-digit number */

    if (digits.length === 10) {
        return `${countryCode}${digits}`;
    }


    /* Number already contains country code */

    const countryDigits =
        countryCode.replace(/\D/g, "");

    if (
        digits.startsWith(countryDigits) &&
        digits.length ===
            countryDigits.length + 10
    ) {
        return `+${digits}`;
    }


    /* Generic international */

    if (
        digits.length >= 10 &&
        digits.length <= 15
    ) {
        return `+${digits}`;
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

    } catch (error) {

        console.warn(
            "reCAPTCHA clear notice:",
            error
        );
    }

    recaptchaVerifier = null;
}


function getRecaptchaVerifier() {

    destroyRecaptcha();

    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
                size: "invisible",

                callback: () => {
                    console.log(
                        "SELLBY: reCAPTCHA verified."
                    );
                },

                "expired-callback": () => {

                    showStatus(
                        "reCAPTCHA expired. Please try again.",
                        "error"
                    );

                    resetSendOtpBtn();
                }
            }
        );

    return recaptchaVerifier;
}


/* =====================================================
   BUTTON RESET
   ===================================================== */

function resetSendOtpBtn() {

    if (!sendOtpBtn) return;

    sendOtpBtn.disabled = false;

    sendOtpBtn.innerHTML = `
        <span>Continue</span>
    `;
}


function resetVerifyBtn() {

    if (!verifyOtpBtn) return;

    verifyOtpBtn.disabled = false;

    verifyOtpBtn.innerHTML = `
        <span>Verify Code</span>
    `;
}


/* =====================================================
   EMAIL LOGIN
   ===================================================== */

if (switchToEmailBtn) {
    switchToEmailBtn.addEventListener("click", () => {
        showStatus("", "");
        if (phoneStep) phoneStep.classList.add("hidden");
        if (otpStep) otpStep.classList.add("hidden");
        if (emailStep) emailStep.classList.remove("hidden");
    });
}

if (switchToPhoneBtn) {
    switchToPhoneBtn.addEventListener("click", () => {
        showStatus("", "");
        if (emailStep) emailStep.classList.add("hidden");
        if (otpStep) otpStep.classList.add("hidden");
        if (phoneStep) phoneStep.classList.remove("hidden");
    });
}

if (emailLoginBtn) {
    emailLoginBtn.addEventListener("click", handleEmailLogin);
}

async function handleEmailLogin() {
    showStatus("", "");
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!email || !email.includes("@")) {
        showStatus("Please enter a valid email address.", "error");
        if (emailInput) emailInput.focus();
        return;
    }

    if (!password) {
        showStatus("Please enter your password.", "error");
        if (passwordInput) passwordInput.focus();
        return;
    }

    emailLoginBtn.disabled = true;
    emailLoginBtn.innerHTML = `<span>Logging in...</span>`;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        showStatus("Login successful! Redirecting...", "success");

        // Sync Firestore user profile if missing
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split("@")[0],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.warn("Firestore profile sync notice:", err);
        }

        setTimeout(() => {
            window.location.replace("index.html");
        }, 500);

    } catch (error) {
        console.error("Email Login Error:", error);
        emailLoginBtn.disabled = false;
        emailLoginBtn.innerHTML = `<span>Login with Email</span>`;

        switch (error.code) {
            case "auth/invalid-email":
                showStatus("Invalid email address format.", "error");
                break;
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
                showStatus("Invalid email or password. Please check your credentials.", "error");
                break;
            case "auth/user-disabled":
                showStatus("This user account has been disabled.", "error");
                break;
            case "auth/too-many-requests":
                showStatus("Too many failed attempts. Please try again later.", "error");
                break;
            default:
                showStatus(error.message || "Failed to log in with email.", "error");
        }
    }
}


/* =====================================================
   SEND OTP
   ===================================================== */

async function handleSendOtp() {

    if (isSendingOtp) return;

    showStatus("", "");

    const rawNumber =
        mobileNumberInput.value.trim();

    const selectedCode =
        countryCodeInput
            ? countryCodeInput.value
            : "+91";


    fullPhoneNumber =
        normalizePhoneNumber(
            rawNumber,
            selectedCode
        );


    /* Validate */

    if (!fullPhoneNumber) {

        showStatus(
            "Please enter a valid 10-digit mobile number.",
            "error"
        );

        mobileNumberInput.focus();

        return;
    }


    isSendingOtp = true;

    sendOtpBtn.disabled = true;

    sendOtpBtn.innerHTML = `
        <span class="spinner-icon"></span>
        Sending OTP...
    `;


    /*
       Firebase test number support.

       Example:
       +1 6505551234
    */

    const isTestNumber =
        fullPhoneNumber.startsWith("+1650555") ||
        fullPhoneNumber.includes("5551234");


    try {

        if (isTestNumber) {

            auth.settings
                .appVerificationDisabledForTesting =
                true;

        } else {

            auth.settings
                .appVerificationDisabledForTesting =
                false;
        }


        /* Create reCAPTCHA */

        const verifier =
            getRecaptchaVerifier();


        await verifier.render();


        /* Firebase Phone Authentication */

        confirmationResult =
            await signInWithPhoneNumber(
                auth,
                fullPhoneNumber,
                verifier
            );


        /* Switch to OTP screen */

        phoneStep.classList.add("hidden");

        otpStep.classList.remove("hidden");


        displayPhoneNumber.textContent =
            fullPhoneNumber;


        /* Reset OTP */

        clearOtpFields();

        disableOtpFields(false);

        otpFields[0].focus();


        /* Status */

        showStatus(
            `OTP sent successfully to ${fullPhoneNumber}`,
            "info"
        );


        /* Timer */

        startCountdown(30);


        /* Android WebOTP */

        listenForWebOTP();


    } catch (error) {

        console.error(
            "Firebase Phone Auth Error:",
            error
        );


        resetSendOtpBtn();


        /* Reset reCAPTCHA */

        if (recaptchaVerifier) {

            try {

                const widgetId =
                    await recaptchaVerifier.render();

                if (
                    typeof grecaptcha !==
                    "undefined"
                ) {
                    grecaptcha.reset(
                        widgetId
                    );
                }

            } catch (e) {

                console.warn(
                    "reCAPTCHA reset notice:",
                    e
                );
            }
        }


        /* Firebase errors */

        switch (error.code) {

            case "auth/invalid-phone-number":

                showStatus(
                    "Invalid mobile number format. Please check the number and country code.",
                    "error"
                );

                break;


            case "auth/too-many-requests":

                showStatus(
                    "Too many requests from this device. Please try again later.",
                    "error"
                );

                break;


            case "auth/quota-exceeded":

                showStatus(
                    "SMS quota exceeded for this Firebase project. Please try again later.",
                    "error"
                );

                break;


            case "auth/billing-not-enabled":

                showStatus(
                    "SMS service requires Firebase billing to be enabled.",
                    "error"
                );

                break;


            case "auth/operation-not-allowed":

                showStatus(
                    `Phone authentication is not enabled. Please check Firebase Phone provider.`,
                    "error"
                );

                break;


            case "auth/unauthorized-domain":

                showStatus(
                    `This domain is not authorized in Firebase: ${window.location.hostname}`,
                    "error"
                );

                break;


            case "auth/captcha-check-failed":

                showStatus(
                    "reCAPTCHA verification failed. Please try again.",
                    "error"
                );

                break;


            default:

                showStatus(
                    error.message ||
                    "Failed to send OTP. Please try again.",
                    "error"
                );
        }

    } finally {

        isSendingOtp = false;
    }
}


/* =====================================================
   VERIFY OTP
   ===================================================== */

async function verifyOtp() {

    if (
        isVerifying ||
        !confirmationResult
    ) {
        return;
    }

    stopWebOtpListener();


    showStatus("", "");


    const otpCode =
        getOtpValue();


    if (otpCode.length !== 6) {

        showStatus(
            "Please enter the complete 6-digit verification code.",
            "error"
        );

        return;
    }


    isVerifying = true;

    verifyOtpBtn.disabled = true;

    verifyOtpBtn.innerHTML = `
        <span class="spinner-icon"></span>
        Verifying...
    `;

    disableOtpFields(true);


    try {

        const userCredential =
            await confirmationResult.confirm(
                otpCode
            );

        const user =
            userCredential.user;


        showStatus(
            "OTP verified! Logging in...",
            "success"
        );


        /* Firestore profile */

        (async () => {

            try {

                const userDocRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );


                const userDocSnap =
                    await getDoc(
                        userDocRef
                    );


                if (!userDocSnap.exists()) {

                    await setDoc(
                        userDocRef,
                        {
                            uid: user.uid,

                            phoneNumber:
                                user.phoneNumber ||
                                fullPhoneNumber,

                            displayName:
                                user.displayName ||
                                `User ${fullPhoneNumber.slice(-4)}`,

                            createdAt:
                                serverTimestamp(),

                            updatedAt:
                                serverTimestamp()
                        }
                    );
                }

            } catch (error) {

                console.warn(
                    "Firestore profile sync notice:",
                    error
                );
            }

        })();


        /* Go Home */

        window.location.replace(
            "index.html"
        );


    } catch (error) {

        console.error(
            "OTP Verification Error:",
            error
        );


        isVerifying = false;

        resetVerifyBtn();

        disableOtpFields(false);


        switch (error.code) {

            case "auth/invalid-verification-code":

                showStatus(
                    "Invalid verification code. Please check and try again.",
                    "error"
                );

                break;


            case "auth/code-expired":

                showStatus(
                    "Verification code has expired. Please resend OTP.",
                    "error"
                );

                break;


            case "auth/session-expired":

                showStatus(
                    "Verification session expired. Please request a new OTP.",
                    "error"
                );

                break;


            case "auth/too-many-requests":

                showStatus(
                    "Too many verification attempts. Please try again later.",
                    "error"
                );

                break;


            default:

                showStatus(
                    error.message ||
                    "Verification failed. Please try again.",
                    "error"
                );
        }
    }
}


/* =====================================================
   OTP UTILITIES
   ===================================================== */

function getOtpValue() {

    return otpFields
        .map(
            field =>
                field.value.trim()
        )
        .join("");
}


function clearOtpFields() {

    otpFields.forEach(field => {

        field.value = "";

        field.classList.remove(
            "filled"
        );
    });
}


function disableOtpFields(disabled) {

    otpFields.forEach(field => {

        field.disabled = disabled;
    });
}


function fillOtpFields(code) {

    const digits =
        code
            .toString()
            .replace(/\D/g, "")
            .slice(0, 6)
            .split("");


    clearOtpFields();


    digits.forEach(
        (digit, index) => {

            if (otpFields[index]) {

                otpFields[index].value =
                    digit;

                otpFields[index]
                    .classList
                    .add("filled");
            }
        }
    );


    if (digits.length > 0) {

        const lastIndex =
            Math.min(
                digits.length - 1,
                5
            );

        otpFields[lastIndex].focus();
    }
}


/* =====================================================
   OTP INPUT EVENTS
   ===================================================== */

otpFields.forEach(
    (field, index) => {

        field.addEventListener(
            "input",
            () => {

                let value =
                    field.value.replace(/\D/g, "");


                /* Paste / autofill */

                if (value.length > 1) {

                    fillOtpFields(
                        value
                    );

                    if (
                        getOtpValue()
                            .length === 6 &&
                        !isVerifying
                    ) {
                        verifyOtp();
                    }

                    return;
                }


                if (value) {

                    field.value = value;

                    field.classList.add(
                        "filled"
                    );


                    if (index < 5) {

                        otpFields[
                            index + 1
                        ].focus();
                    }

                } else {

                    field.value = "";

                    field.classList.remove(
                        "filled"
                    );
                }


                /* Auto verify */

                if (
                    getOtpValue()
                        .length === 6 &&
                    !isVerifying
                ) {
                    verifyOtp();
                }
            }
        );


        field.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Backspace"
                ) {

                    if (
                        !field.value &&
                        index > 0
                    ) {

                        otpFields[
                            index - 1
                        ].focus();

                        otpFields[
                            index - 1
                        ].value = "";

                        otpFields[
                            index - 1
                        ]
                            .classList
                            .remove(
                                "filled"
                            );

                    } else {

                        field.value = "";

                        field.classList.remove(
                            "filled"
                        );
                    }
                }


                else if (
                    event.key ===
                    "ArrowLeft" &&
                    index > 0
                ) {

                    otpFields[
                        index - 1
                    ].focus();

                }


                else if (
                    event.key ===
                    "ArrowRight" &&
                    index < 5
                ) {

                    otpFields[
                        index + 1
                    ].focus();
                }
            }
        );


        /* Paste */

        field.addEventListener(
            "paste",
            (event) => {

                event.preventDefault();

                const pastedData =
                    (
                        event.clipboardData ||
                        window.clipboardData
                    )
                    .getData("text");


                fillOtpFields(
                    pastedData
                );


                if (
                    getOtpValue()
                        .length === 6 &&
                    !isVerifying
                ) {
                    verifyOtp();
                }
            }
        );
    }
);


/* =====================================================
   ANDROID WEB OTP & LIFECYCLE
   ===================================================== */

function stopWebOtpListener() {

    if (webOtpAbortController) {

        try {

            webOtpAbortController.abort();

        } catch (e) {}

        webOtpAbortController = null;
    }
}


function listenForWebOTP() {

    stopWebOtpListener();

    if (
        !("OTPCredential" in window)
    ) {
        return;
    }

    try {

        webOtpAbortController =
            new AbortController();


        navigator.credentials
            .get({
                otp: {
                    transport: ["sms"]
                },
                signal:
                    webOtpAbortController.signal
            })

            .then((otp) => {

                if (
                    otp &&
                    otp.code
                ) {

                    const code =
                        otp.code
                            .replace(
                                /\D/g,
                                ""
                            )
                            .slice(
                                0,
                                6
                            );


                    if (
                        code.length === 6 &&
                        !isVerifying
                    ) {

                        fillOtpFields(
                            code
                        );

                        verifyOtp();
                    }
                }

            })

            .catch((error) => {

                if (
                    error &&
                    error.name !== "AbortError"
                ) {
                    console.log(
                        "WebOTP notice:",
                        error.message ||
                        error
                    );
                }

            })

            .finally(() => {

                webOtpAbortController = null;
            });

    } catch (err) {

        console.warn(
            "WebOTP initialization notice:",
            err
        );
    }
}

window.addEventListener("beforeunload", stopWebOtpListener);
window.addEventListener("unload", stopWebOtpListener);


/* =====================================================
   COUNTDOWN
   ===================================================== */

function startCountdown(
    seconds = 30
) {

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );
    }


    resendOtpBtn.disabled =
        true;

    timerCountdown.style.display =
        "inline";


    let remaining =
        seconds;


    timerCountdown.innerHTML =
        `in <strong>${remaining}s</strong>`;


    countdownInterval =
        setInterval(
            () => {

                remaining -= 1;


                if (
                    remaining <= 0
                ) {

                    clearInterval(
                        countdownInterval
                    );

                    resendOtpBtn.disabled =
                        false;

                    timerCountdown.style.display =
                        "none";

                } else {

                    timerCountdown.innerHTML =
                        `in <strong>${remaining}s</strong>`;
                }

            },
            1000
        );
}


/* =====================================================
   CHANGE NUMBER
   ===================================================== */

function changeNumber() {

    stopWebOtpListener();

    if (countdownInterval) {

        clearInterval(
            countdownInterval
        );

        countdownInterval =
            null;
    }


    confirmationResult =
        null;

    fullPhoneNumber =
        "";


    clearOtpFields();

    disableOtpFields(false);


    otpStep.classList.add(
        "hidden"
    );

    phoneStep.classList.remove(
        "hidden"
    );


    resetSendOtpBtn();

    showStatus("", "");


    mobileNumberInput.focus();
}


/* =====================================================
   EVENT LISTENERS
   ===================================================== */

sendOtpBtn.addEventListener(
    "click",
    handleSendOtp
);


mobileNumberInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            handleSendOtp();
        }
    }
);


verifyOtpBtn.addEventListener(
    "click",
    verifyOtp
);


resendOtpBtn.addEventListener(
    "click",
    async () => {

        if (
            resendOtpBtn.disabled
        ) {
            return;
        }


        showStatus(
            "Resending verification code...",
            "info"
        );


        await handleSendOtp();
    }
);


changeNumberBtn.addEventListener(
    "click",
    changeNumber
);


/* =====================================================
   COUNTRY CODE
   ===================================================== */

if (countryCodeInput) {

    countryCodeInput.addEventListener(
        "change",
        () => {

            mobileNumberInput.value =
                mobileNumberInput.value
                    .replace(/\D/g, "")
                    .slice(0, 15);

            showStatus("", "");
        }
    );
}


/* =====================================================
   MOBILE INPUT
   ===================================================== */

mobileNumberInput.addEventListener(
    "input",
    () => {

        mobileNumberInput.value =
            mobileNumberInput.value
                .replace(/\D/g, "")
                .slice(0, 15);
    }
);


console.log(
    "SELLBY Login: Firebase OTP system loaded successfully."
);
