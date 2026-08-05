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

const recognition =

    new SpeechRecognition();

recognition.lang =

    "en-IN";

recognition.interimResults =

    false;

recognition.continuous =

    false;

startVoiceBtn.addEventListener(

    "click",

    () => {

        voiceStatus.textContent =

            "🎤 Listening...";

        recognition.start();

    }

);
/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : voice-post.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Speech Result
    ✔ Parse Speech
    ✔ Update Fields
*/
/* ===================================================== */

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

    console.error(event.error);

    voiceStatus.textContent =

        "❌ Voice recognition failed.";

};

recognition.onend = () => {

    startVoiceBtn.disabled = false;

};
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