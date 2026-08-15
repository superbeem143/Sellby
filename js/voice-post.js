/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const photosInput = document.getElementById("photos");
const imagePreview = document.getElementById("imagePreview");
const previewCount = document.getElementById("previewCount");
const adDescription = document.getElementById("adDescription");
const micBtn = document.getElementById("micBtn");
const publishBtn = document.getElementById("publishBtn");
const statusMessage = document.getElementById("statusMessage");

const adTitle = document.getElementById("adTitle");
const adPrice = document.getElementById("adPrice");
const adLocation = document.getElementById("adLocation");

const CLOUD_NAME = "onrnn2hn";
const UPLOAD_PRESET = "mvrproperties";

let selectedFiles = [];
const MAX_IMAGES = 10;

/* 1. PHOTO HANDLING */
if (photosInput) {
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
}

function renderPreview() {
    if (!imagePreview) return;
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
    if (previewCount) previewCount.textContent = `${selectedFiles.length} / ${MAX_IMAGES} images selected`;
}

/* 2. SPEECH RECOGNITION (ANDROID NATIVE BRIDGE) */
let isMicActive = false;

// Native Callbacks defined globally
window.onSpeechResults = (text) => {
    // Append to existing text in textarea
    const currentText = adDescription.value.trim();
    adDescription.value = (currentText + (currentText ? " " : "") + text).trim();
    adDescription.scrollTop = adDescription.scrollHeight;
    stopMic();
};

window.onSpeechPartialResults = (text) => {
    // We show partial results as a visual hint in status,
    // we don't append partials to textarea to avoid duplicate text.
    if (voiceStatus) voiceStatus.textContent = "🎤 Listening: " + text;
};

window.onSpeechError = (msg) => {
    console.warn("Voice Post Native Speech Error:", msg);
    // Error 7 is no-match (often silence)
    if (!msg.includes("(7)") && !msg.includes("(8)")) {
        alert("Speech Error: " + msg);
    }
    stopMic();
};

window.onSpeechStarted = () => {
    isMicActive = true;
    micBtn.classList.add("recording");
    micBtn.innerHTML = "⏹️";
    if (voiceStatus) voiceStatus.textContent = "🔴 Listening... Speak clearly.";
};

window.onSpeechEnded = () => {
    // Session ended naturally
    stopMic();
};

function startMic() {
    if (window.AndroidSpeech) {
        const currentLang = localStorage.getItem("sellby_lang") || "en";
        let langCode = "en-IN";
        if (currentLang === "te") langCode = "te-IN";
        else if (currentLang === "hi") langCode = "hi-IN";

        window.AndroidSpeech.startListening(langCode);
    } else {
        console.warn("AndroidSpeech bridge not found. Browsers not supported.");
        alert("Speech recognition is only available in the Android app.");
    }
}

function stopMic() {
    isMicActive = false;
    if (window.AndroidSpeech) {
        window.AndroidSpeech.stopListening();
    }
    micBtn.classList.remove("recording");
    micBtn.innerHTML = "🎤";
    if (voiceStatus) voiceStatus.textContent = "✅ Processing complete.";
}

if (micBtn) {
    micBtn.onclick = (e) => {
        e.preventDefault();
        if (isMicActive) {
            stopMic();
        } else {
            startMic();
        }
    };
}

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

if (publishBtn) {
    publishBtn.addEventListener("click", async () => {
        if (!auth.currentUser) {
            alert("Please log in first.");
            window.location.href = "login.html";
            return;
        }

        const description = adDescription.value.trim();
        const title = adTitle.value.trim();
        const price = adPrice.value.trim();
        const location = adLocation.value.trim();

        if (!title || !price || !location || !description || selectedFiles.length === 0) {
            alert("Please fill all fields and upload at least one photo.");
            return;
        }

        publishBtn.disabled = true;
        publishBtn.textContent = "⏳ Publishing...";
        if (statusMessage) {
            statusMessage.textContent = "Uploading images...";
            statusMessage.style.color = "#6d28d9";
        }

        try {
            const imageUrls = [];
            for (const file of selectedFiles) {
                if (statusMessage) statusMessage.textContent = `Uploading photo ${imageUrls.length + 1} of ${selectedFiles.length}...`;
                const url = await uploadToCloudinary(file);
                imageUrls.push(url);
            }

            if (statusMessage) statusMessage.textContent = "Saving to database...";

            const docData = {
                category: "others",
                subCategory: "voice-post",
                sellerId: auth.currentUser.uid,
                sellerEmail: auth.currentUser.email || "",
                title,
                price: Number(price),
                location,
                description,
                imageUrls,
                status: "published",
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "ads"), docData);

            if (statusMessage) {
                statusMessage.textContent = "✅ Ad Published Successfully!";
                statusMessage.style.color = "#16a34a";
            }
            publishBtn.textContent = "Published!";

            alert("Success: Your ad is now live!");
            window.location.href = "index.html";

        } catch (error) {
            console.error("Voice Publish Error:", error);
            alert(`Failed to publish: ${error.message}`);
            if (statusMessage) {
                statusMessage.textContent = "❌ Error: " + error.message;
                statusMessage.style.color = "#dc2626";
            }
            publishBtn.disabled = false;
            publishBtn.textContent = "Publish Ad";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("SELLBY Voice Post Page Ready");
});
