/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/* ===================================================== */

import { parseSpeech } from "./speech-parser.js";

const startVoiceBtn = document.getElementById("startVoiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const speechResult = document.getElementById("speechResult");

// Photo Elements
const cameraBtn = document.getElementById("cameraBtn");
const galleryBtn = document.getElementById("galleryBtn");
const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");
const photoPreview = document.getElementById("photoPreview");
const removePhotoBtn = document.getElementById("removePhotoBtn");

let selectedImage = null;
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioUrl = null;

// Photo Handling
if (cameraBtn) cameraBtn.onclick = () => cameraInput.click();
if (galleryBtn) galleryBtn.onclick = () => galleryInput.click();

cameraInput.onchange = handleImageSelect;
galleryInput.onchange = handleImageSelect;

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

if (removePhotoBtn) {
    removePhotoBtn.onclick = () => {
        selectedImage = null;
        cameraInput.value = "";
        galleryInput.value = "";
        photoPreviewContainer.style.display = "none";
    };
}

// Speech Recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
    try {
        recognition = new SpeechRecognition();

        // Detect App Language for better recognition
        const currentLang = localStorage.getItem("sellby_lang") || "en";
        if (currentLang === "te") recognition.lang = "te-IN";
        else if (currentLang === "hi") recognition.lang = "hi-IN";
        else recognition.lang = "en-IN";

        recognition.interimResults = true;
        recognition.continuous = false;
    } catch (e) {
        console.error("Speech init error:", e);
    }
}

if (startVoiceBtn) {
    startVoiceBtn.addEventListener("click", async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            stopRecording();
            return;
        }

        if (!recognition) {
            alert("Speech recognition not supported.");
            return;
        }

        try {
            voiceStatus.textContent = "⌛ Starting Microphone...";
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // 1. Audio Recording
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                recordedAudioUrl = URL.createObjectURL(audioBlob);
                showAudioPlayback(recordedAudioUrl);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();

            // 2. Speech Recognition
            speechResult.value = "";
            recognition.start();

            voiceStatus.textContent = "🔴 Listening... Speak now";
            startVoiceBtn.innerHTML = "⏹️ Stop Recording";
            startVoiceBtn.style.background = "#ef4444";

        } catch (e) {
            console.error("Recording start error:", e);
            alert("Please allow microphone access.");
            voiceStatus.textContent = "❌ Permission denied";
        }
    });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    startVoiceBtn.innerHTML = "🎤 Start Recording";
    startVoiceBtn.style.background = "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)";
}

if (recognition) {
    recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                // Showing interim results in the box for better UX
                speechResult.value = event.results[i][0].transcript;
            }
        }

        if (finalTranscript) {
            speechResult.value = finalTranscript;
            voiceStatus.textContent = "✅ Speech recognized.";
        }
    };

    recognition.onerror = () => {
        voiceStatus.textContent = "⚠️ Listening ended.";
        stopRecording();
    };

    recognition.onend = () => {
        if (voiceStatus.textContent.includes("Listening")) {
             voiceStatus.textContent = "✅ Processing complete.";
             stopRecording();
        }
    };
}

function showAudioPlayback(url) {
    let player = document.getElementById("voicePlayback");
    if (!player) {
        player = document.createElement("audio");
        player.id = "voicePlayback";
        player.controls = true;
        player.style.width = "100%";
        player.style.marginTop = "15px";
        voiceStatus.parentNode.insertBefore(player, voiceStatus.nextSibling);
    }
    player.src = url;
    player.style.display = "block";
}

const continueBtn = document.getElementById("continueBtn");
if (continueBtn) {
    continueBtn.onclick = () => {
        const fullText = speechResult.value.trim();

        if (!fullText) {
            alert("Please record or type your ad details first.");
            return;
        }

        // Use parseSpeech ONLY for routing (category detection)
        const parsed = parseSpeech(fullText);
        const cat = parsed.category || "others";

        // Save ONLY the description to localStorage
        const voiceData = {
            description: fullText
        };
        localStorage.setItem("voice_post_data", JSON.stringify(voiceData));

        window.location.href = `post-${cat}.html?voice=true`;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    voiceStatus.textContent = "Ready to record...";
});
