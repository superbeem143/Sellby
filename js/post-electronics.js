/* ===================================================== */
/*            SELLBY POST-ELECTRONICS.JS                */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { t, getTranslations } from "./i18n.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const CLOUD_NAME = "onrnn2hn";
const UPLOAD_PRESET = "mvrproperties";

const publishBtn = document.getElementById("publishBtn");
const photosInput = document.getElementById("photos");
const imagePreview = document.getElementById("imagePreview");
const previewCount = document.getElementById("previewCount");
const statusMessage = document.getElementById("statusMessage");

let selectedFiles = [];
const MAX_IMAGES = 10;

function localizeUI() {
    const trans = getTranslations();
    const h1 = document.querySelector(".page-title h1");
    if (h1) h1.textContent = trans.post_electronics;
    if (publishBtn) publishBtn.textContent = trans.publish;
}

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
        thumb.style.position = "relative";

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "×";
        removeBtn.style.cssText = "position:absolute;top:5px;right:5px;background:rgba(220,38,38,0.8);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;z-index:10;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;font-weight:bold;";
        removeBtn.onclick = (e) => {
            e.preventDefault();
            selectedFiles.splice(index, 1);
            renderPreview();
        };

        reader.onload = (e) => {
            const img = document.createElement("img");
            img.src = e.target.result;
            thumb.appendChild(img);
            thumb.appendChild(removeBtn);
        };
        reader.readAsDataURL(file);
        imagePreview.appendChild(thumb);
    });
    previewCount.textContent = `${selectedFiles.length} / ${MAX_IMAGES} ${t('profile_photo')}`;
}

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

function getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

publishBtn.addEventListener("click", async () => {
    if (!auth.currentUser) {
        alert(t('login_first'));
        window.location.href = "login.html";
        return;
    }

    const productName = getFieldValue("productName");
    const price = getFieldValue("price");
    const location = getFieldValue("location");
    const description = getFieldValue("description");

    if (selectedFiles.length === 0 || !productName || !price) {
        alert(t('identity_required'));
        return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = t('uploading');

    try {
        const imageUrls = [];
        for (const file of selectedFiles) {
            const url = await uploadToCloudinary(file);
            imageUrls.push(url);
        }

        const docData = {
            category: "electronics",
            sellerId: auth.currentUser.uid,
            sellerEmail: auth.currentUser.email || "",
            productName,
            price: Number(price),
            location,
            description,
            imageUrls,
            status: "published",
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "ads"), docData);
        alert(t('success'));
        window.location.href = "category.html?type=electronics";
    } catch (error) {
        console.error(error);
        alert(`${t('failed')} (${error.message})`);
        publishBtn.disabled = false;
        publishBtn.textContent = t('publish');
    }
});

function prefillVoiceData() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("voice") === "true") {
        const rawData = localStorage.getItem("voice_post_data");
        if (rawData) {
            try {
                const data = JSON.parse(rawData);
                if (data.productName) document.getElementById("productName").value = data.productName;
                if (data.price) document.getElementById("price").value = data.price;
                if (data.location) document.getElementById("location").value = data.location;
                if (data.description) document.getElementById("description").value = data.description;

                // Clear after use
                localStorage.removeItem("voice_post_data");
            } catch (e) {
                console.warn("Voice data parse failed:", e);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    localizeUI();
    prefillVoiceData();
});
