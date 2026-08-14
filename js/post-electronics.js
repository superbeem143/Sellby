/* ===================================================== */
/*            SELLBY POST-ELECTRONICS.JS                */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { t } from "./i18n.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const CLOUD_NAME = "onrmn2hn";
const UPLOAD_PRESET = "mvrproperties";

const publishBtn = document.getElementById("publishBtn");
const photosInput = document.getElementById("photos");
const imagePreview = document.getElementById("imagePreview");
const previewCount = document.getElementById("previewCount");
const statusMessage = document.getElementById("statusMessage");

let selectedFiles = [];
const MAX_IMAGES = 10;

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
    previewCount.textContent = `${selectedFiles.length} / ${MAX_IMAGES} images selected`;
}

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData
    });
    if (!resp.ok) throw new Error("Image upload failed");
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
    const brand = getFieldValue("brand");
    const condition = getFieldValue("condition");
    const price = getFieldValue("price");
    const location = getFieldValue("location");
    const warranty = getFieldValue("warranty");
    const description = getFieldValue("description");

    if (selectedFiles.length === 0) {
        alert(t('identity_required'));
        return;
    }
    if (!productName || !price) {
        alert(t('identity_required'));
        return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = t('uploading');
    statusMessage.textContent = t('uploading');

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
            brand,
            condition,
            price: Number(price),
            location,
            warranty,
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
        alert(t('failed'));
        publishBtn.disabled = false;
        publishBtn.textContent = t('publish');
    }
});
