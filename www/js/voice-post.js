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

// Photo Elements
const cameraBtn = document.getElementById("cameraBtn");
const galleryBtn = document.getElementById("galleryBtn");
const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");
const photoPreview = document.getElementById("photoPreview");
const removePhotoBtn = document.getElementById("removePhotoBtn");

let selectedImage = null;

// Photo Handling
if (cameraBtn) {
    cameraBtn.addEventListener("click", () => cameraInput.click());
}

if (galleryBtn) {
    galleryBtn.addEventListener("click", () => galleryInput.click());
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        selectedImage = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            photoPreview.src = event.target.result;
            photoPreviewContainer.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

cameraInput.addEventListener("change", handleImageSelect);
galleryInput.addEventListener("change", handleImageSelect);

if (removePhotoBtn) {
    removePhotoBtn.addEventListener("click", () => {
        selectedImage = null;
        cameraInput.value = "";
        galleryInput.value = "";
        photoPreview.src = "";
        photoPreviewContainer.style.display = "none";
    });
}

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
        async () => {
            if (!recognition) {
                alert("Speech recognition is not supported in this browser. Please try using Google Chrome or Microsoft Edge.");
                if (voiceStatus) voiceStatus.textContent = "⚠️ Speech recognition unsupported.";
                return;
            }

            try {
                // Pre-check microphone permission using the logic that works in Chat
                voiceStatus.textContent = "⌛ Checking microphone access...";
                await navigator.mediaDevices.getUserMedia({ audio: true });

                voiceStatus.textContent = "🎤 Listening... Speak now.";
                startVoiceBtn.disabled = true;
                recognition.start();

            } catch (e) {
                console.error("Microphone access error:", e);
                if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
                    alert("Microphone permission denied. Please allow microphone access in Android settings for SELLBY.");
                    if (voiceStatus) voiceStatus.textContent = "🚫 Permission denied.";
                } else {
                    alert("Could not access microphone. Please try again.");
                }
                startVoiceBtn.disabled = false;
            }
        }
    );
}

if (recognition) {
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        speechResult.value = transcript;
        voiceStatus.textContent = "✅ Voice captured successfully.";

        // Parse speech results
        const parsedData = parseSpeech(transcript);
        detectedCategory.value = parsedData.category || "";
        detectedPrice.value = parsedData.price || "";
        detectedLocation.value = parsedData.location || "";
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            alert("Microphone permission denied. Please allow microphone access in Android settings.");
            voiceStatus.textContent = "🚫 Permission denied.";
        } else if (event.error === "no-speech") {
            voiceStatus.textContent = "⚠️ No speech detected. Tap to try again.";
        } else if (event.error === "network") {
            voiceStatus.textContent = "⚠️ Network error. Check your connection.";
        } else {
            voiceStatus.textContent = "❌ Recognition failed. Tap to try again.";
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