/* ===================================================== */
/*               SELLBY VOICE-POST.JS                    */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { initTranslations, t, getLanguage } from "./i18n.js";

const photosInput = document.getElementById("photos");
const imageGrid = document.getElementById("imageGrid");
const currentImgCount = document.getElementById("currentImgCount");
const addImgHeaderBtn = document.getElementById("addImgHeaderBtn");
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
    if (!imageGrid) return;
    imageGrid.innerHTML = "";

    selectedFiles.forEach((file, index) => {
        const tile = document.createElement("div");
        tile.className = "thumb-tile";

        const img = document.createElement("img");
        img.alt = `Preview ${index + 1}`;

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-thumb-btn";
        removeBtn.innerHTML = "×";
        removeBtn.title = "Remove image";
        removeBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectedFiles.splice(index, 1);
            renderPreview();
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        tile.appendChild(img);
        tile.appendChild(removeBtn);
        imageGrid.appendChild(tile);
    });

    if (selectedFiles.length < MAX_IMAGES) {
        const addTile = document.createElement("div");
        addTile.className = "add-tile";
        addTile.onclick = () => photosInput && photosInput.click();
        addTile.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#db2777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>Add Image</span>
        `;
        imageGrid.appendChild(addTile);
    }

    if (currentImgCount) {
        currentImgCount.textContent = selectedFiles.length;
    }

    if (addImgHeaderBtn) {
        if (selectedFiles.length >= MAX_IMAGES) {
            addImgHeaderBtn.style.opacity = "0.5";
            addImgHeaderBtn.style.pointerEvents = "none";
        } else {
            addImgHeaderBtn.style.opacity = "1";
            addImgHeaderBtn.style.pointerEvents = "auto";
        }
    }
}

/* 2. SPEECH RECOGNITION (ANDROID NATIVE BRIDGE) */
window.onSpeechResults = (text) => {
    if (adDescription) {
        const currentText = adDescription.value.trim();
        adDescription.value = (currentText + (currentText ? " " : "") + text).trim();
        adDescription.scrollTop = adDescription.scrollHeight;
    }
};

window.onSpeechError = (msg) => {
    console.warn("Speech error:", msg);
    if (msg) alert(msg);
};

if (micBtn) {
    micBtn.onclick = (e) => {
        e.preventDefault();
        if (window.AndroidSpeech) {
            const currentLang = getLanguage();
            let langCode = "en-IN";
            if (currentLang === "te") langCode = "te-IN";
            else if (currentLang === "hi") langCode = "hi-IN";

            window.AndroidSpeech.startListening(langCode);
        } else {
            console.warn("AndroidSpeech bridge not found.");
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
            alert(t('login_first') || "Please log in first.");
            window.location.href = "login.html";
            return;
        }

        const description = adDescription ? adDescription.value.trim() : "";

        const title = (adTitle && adTitle.value) ? adTitle.value.trim() : (description ? description.substring(0, 30) + (description.length > 30 ? "..." : "") : "Voice Ad");
        const price = (adPrice && adPrice.value) ? adPrice.value.trim() : "0";
        const location = (adLocation && adLocation.value) ? adLocation.value.trim() : "Not Specified";

        if (!description || selectedFiles.length === 0) {
            alert(t('identity_required') || "Please add at least one photo and a description.");
            return;
        }

        publishBtn.disabled = true;
        publishBtn.textContent = "⏳ " + (t('uploading') || "Publishing...");
        if (statusMessage) {
            statusMessage.textContent = t('uploading') || "Uploading images...";
            statusMessage.style.color = "#6d28d9";
        }

        try {
            const imageUrls = [];
            for (const file of selectedFiles) {
                if (statusMessage) statusMessage.textContent = `${t('uploading') || 'Uploading'}... (${imageUrls.length + 1}/${selectedFiles.length})`;
                const url = await uploadToCloudinary(file);
                imageUrls.push(url);
            }

            if (statusMessage) statusMessage.textContent = t('loading') || "Saving to database...";

            const docData = {
                category: "others",
                subCategory: "voice-post",
                sellerId: auth.currentUser.uid,
                sellerEmail: auth.currentUser.email || "",
                title,
                price: Number(price) || 0,
                location,
                description,
                imageUrls,
                status: "published",
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "ads"), docData);

            if (statusMessage) {
                statusMessage.textContent = t('publish_success') || "✅ Ad Published Successfully!";
                statusMessage.style.color = "#16a34a";
            }
            publishBtn.textContent = "Published!";

            alert(t('success') || "Success: Your ad is now live!");
            window.location.href = "index.html";

        } catch (error) {
            console.error("Voice Publish Error:", error);
            alert((t('failed') || "Failed to publish: ") + error.message);
            if (statusMessage) {
                statusMessage.textContent = "❌ Error: " + error.message;
                statusMessage.style.color = "#dc2626";
            }
            publishBtn.disabled = false;
            publishBtn.textContent = t('publish') || "Publish Ad";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTranslations();
    renderPreview();
    console.log("SELLBY Voice Post Page Ready");
});
