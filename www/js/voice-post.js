/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const CLOUD_NAME = "onrnn2hn";
const UPLOAD_PRESET = "mvrproperties";

const photosInput = document.getElementById("photos");
const imagePreview = document.getElementById("imagePreview");
const previewCount = document.getElementById("previewCount");
const adDescription = document.getElementById("adDescription");
const micBtn = document.getElementById("micBtn");
const publishBtn = document.getElementById("publishBtn");
const statusMessage = document.getElementById("statusMessage");

let selectedFiles = [];
const MAX_IMAGES = 10;

/* 1. PHOTO HANDLING */
photosInput.addEventListener("change", () => {
    const files = Array.from(photosInput.files);
    files.forEach(file => {
        if (selectedFiles.length < MAX_IMAGES && file.type.startsWith("image/")) {
            selectedFiles.push(file);
        }
    });
    renderPreview();
    photosInput.value = "";
});

function renderPreview() {
    imagePreview.innerHTML = "";
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        const thumb = document.createElement("div");
        thumb.className = "preview-thumb";

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-img";
        removeBtn.innerHTML = "×";
        removeBtn.onclick = (e) => {
            e.preventDefault();
            selectedFiles.splice(index, 1);
            renderPreview();
        };

        reader.onload = (e) => {
            thumb.innerHTML = `<img src="${e.target.result}">`;
            thumb.appendChild(removeBtn);
        };
        reader.readAsDataURL(file);
        imagePreview.appendChild(thumb);
    });
    previewCount.textContent = `${selectedFiles.length} / ${MAX_IMAGES} images selected`;
}

/* 2. SPEECH RECOGNITION (VOICE TO TEXT ONLY) */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let finalTranscriptAccumulator = "";
let isMicActive = false;

if (SpeechRecognition) {
    try {
        recognition = new SpeechRecognition();

        const currentLang = localStorage.getItem("sellby_lang") || "en";
        if (currentLang === "te") recognition.lang = "te-IN";
        else if (currentLang === "hi") recognition.lang = "hi-IN";
        else recognition.lang = "en-IN";

        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptAccumulator += transcript + " ";
                } else {
                    interimTranscript += transcript;
                }
            }
            adDescription.value = (finalTranscriptAccumulator + interimTranscript).trim();
            adDescription.scrollTop = adDescription.scrollHeight;
        };

        recognition.onerror = (e) => {
            console.warn("Speech recognition error:", e.error);
            if (e.error === "not-allowed") {
                alert("Microphone permission denied. Please allow it in settings.");
            }
            stopMic();
        };

        recognition.onend = () => {
            if (isMicActive) {
                try {
                    recognition.start();
                } catch(err) {
                    stopMic();
                }
            }
        };

    } catch (e) {
        console.error("Speech Recognition initialization failed:", e);
    }
}

async function startMic() {
    if (!recognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    try {
        // Request microphone access from the browser/WebView
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately, we only needed it to trigger the permission prompt
        stream.getTracks().forEach(track => track.stop());

        finalTranscriptAccumulator = adDescription.value ? adDescription.value + " " : "";
        isMicActive = true;
        micBtn.classList.add("recording");
        micBtn.innerHTML = "⏹️";

        recognition.start();
    } catch (e) {
        console.error("Mic start failed:", e);
        if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
            alert("Microphone permission denied. Please allow microphone access in your phone settings for the SELLBY app.");
        } else {
            alert("Could not start microphone. Please try again.");
        }
        stopMic();
    }
}

function stopMic() {
    isMicActive = false;
    if (recognition) {
        try { recognition.stop(); } catch(e) {}
    }
    micBtn.classList.remove("recording");
    micBtn.innerHTML = "🎤";
}

micBtn.onclick = (e) => {
    e.preventDefault();
    if (isMicActive) {
        stopMic();
    } else {
        startMic();
    }
};

/* 3. CLOUDINARY & FIREBASE PIPELINE */
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
    });
    if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Cloudinary Upload Failed");
    }
    const data = await resp.json();
    return data.secure_url;
}

publishBtn.addEventListener("click", async () => {
    if (!auth.currentUser) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    const description = adDescription.value.trim();

    if (!description) {
        alert("Please provide ad details (speak or type).");
        return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = "⏳ Publishing...";
    statusMessage.textContent = "Uploading images...";
    statusMessage.style.color = "#6d28d9";

    try {
        const imageUrls = [];
        for (const file of selectedFiles) {
            statusMessage.textContent = `Uploading photo ${imageUrls.length + 1} of ${selectedFiles.length}...`;
            const url = await uploadToCloudinary(file);
            imageUrls.push(url);
        }

        statusMessage.textContent = "Saving to database...";

        const docData = {
            category: "others",
            subCategory: "voice-post",
            sellerId: auth.currentUser.uid,
            sellerEmail: auth.currentUser.email || "",
            title: description.substring(0, 40) + (description.length > 40 ? "..." : ""),
            price: 0,
            location: "Local",
            description,
            imageUrls,
            status: "published",
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "ads"), docData);

        statusMessage.textContent = "✅ Ad Published Successfully!";
        statusMessage.style.color = "#16a34a";
        publishBtn.textContent = "Published!";

        alert("Success: Your ad is now live!");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Voice Publish Error:", error);
        alert(`Failed to publish: ${error.message}`);
        statusMessage.textContent = "❌ Error: " + error.message;
        statusMessage.style.color = "#dc2626";
        publishBtn.disabled = false;
        publishBtn.textContent = "Publish";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("SELLBY Voice Post Direct Pipeline Ready");
});
