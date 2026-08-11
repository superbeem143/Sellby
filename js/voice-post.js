/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : voice-post.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Speech Recognition
    ✔ DOM Elements
    ✔ Start Recording
    ✔ Status Update
*/
/* ===================================================== */

const startVoiceBtn =

    document.getElementById("startVoiceBtn");

const voiceStatus =

    document.getElementById("voiceStatus");

const speechResult =

    document.getElementById("speechResult");

const detectedCategory =

    document.getElementById("detectedCategory");

const detectedPrice =

    document.getElementById("detectedPrice");

const detectedLocation =

    document.getElementById("detectedLocation");

const SpeechRecognition =

    window.SpeechRecognition ||

    window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    try {

        recognition = new SpeechRecognition();

        recognition.lang = "en-IN";

        recognition.interimResults = false;

        recognition.continuous = false;

    } catch (e) {

        console.error("SpeechRecognition initialization failed:", e);

    }

}

if (startVoiceBtn) {

    startVoiceBtn.addEventListener(

        "click",

        () => {

            if (!recognition) {

                alert("Speech recognition is not supported in this browser. Please try using Google Chrome or Microsoft Edge.");

                if (voiceStatus) voiceStatus.textContent = "⚠️ Speech recognition unsupported in this browser.";

                return;

            }

            try {

                voiceStatus.textContent = "🎤 Listening... Speak now.";

                startVoiceBtn.disabled = true;

                recognition.start();

            } catch (e) {

                console.warn("Speech recognition start notice:", e);

                startVoiceBtn.disabled = false;

            }

        }

    );

}

if (recognition) {

    recognition.onresult = (event) => {

        const transcript =

            event.results[0][0].transcript;

        speechResult.value =

            transcript;

        voiceStatus.textContent =

            "✅ Voice captured successfully.";

        const parsedData =

            parseSpeech(transcript);

        detectedCategory.value =

            parsedData.category || "";

        detectedPrice.value =

            parsedData.price || "";

        detectedLocation.value =

            parsedData.location || "";

    };

    recognition.onerror = (event) => {

        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {

            alert("Microphone permission denied. Please click the lock icon in your browser address bar to allow microphone access for SELLBY.");

            voiceStatus.textContent = "🚫 Microphone permission denied.";

        } else if (event.error === "no-speech") {

            voiceStatus.textContent = "⚠️ No speech detected. Please tap microphone and speak again.";

        } else if (event.error === "network") {

            voiceStatus.textContent = "⚠️ Network error during speech recognition.";

        } else {

            voiceStatus.textContent = "❌ Voice recognition failed. Tap to try again.";

        }

    };

    recognition.onend = () => {

        if (startVoiceBtn) startVoiceBtn.disabled = false;

    };

}
/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : voice-post.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Continue Button
    ✔ Redirect to Category
    ✔ Page Ready
*/
/* ===================================================== */

const continueBtn =

    document.getElementById("continueBtn");

continueBtn.addEventListener(

    "click",

    () => {

        const category =

            detectedCategory.value

            .trim()

            .toLowerCase();

        if (!category) {

            alert(

                "Please record your voice first."

            );

            return;

        }

        window.location.href =

            `post-${category}.html`;

    }

);

document.addEventListener(

    "DOMContentLoaded",

    () => {

        voiceStatus.textContent =

            "Ready to listen...";

        console.log(

            "Voice Posting Ready"

        );

    }

);