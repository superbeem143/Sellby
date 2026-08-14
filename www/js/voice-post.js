/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/* ===================================================== */

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
let finalTranscript = "";

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

        // Detect App Language
        const currentLang = localStorage.getItem("sellby_lang") || "en";
        if (currentLang === "te") recognition.lang = "te-IN";
        else if (currentLang === "hi") recognition.lang = "hi-IN";
        else recognition.lang = "en-IN";

        recognition.interimResults = true;
        recognition.continuous = true;
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
            finalTranscript = "";
            speechResult.value = "";
            recognition.start();

            voiceStatus.textContent = "🔴 Recording & Listening...";
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
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }
        speechResult.value = (finalTranscript + interimTranscript).trim();
        voiceStatus.textContent = "✅ Listening...";
    };

    recognition.onerror = (event) => {
        console.error("Recognition error:", event.error);
        if (event.error !== 'no-speech') {
            voiceStatus.textContent = "⚠️ Recognition interrupted.";
            stopRecording();
        }
    };

    recognition.onend = () => {
        if (voiceStatus.textContent.includes("Listening")) {
             voiceStatus.textContent = "✅ Recording finalized.";
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

        // Voice Posting has NO fixed category. It always routes to Other Post.
        const voiceData = {
            description: fullText
        };
        localStorage.setItem("voice_post_data", JSON.stringify(voiceData));

        // Always redirect to post-others.html (Generic / Other Post)
        window.location.href = "post-others.html?voice=true";
    };
}

document.addEventListener("DOMContentLoaded", () => {
    voiceStatus.textContent = "Ready to record...";
});
