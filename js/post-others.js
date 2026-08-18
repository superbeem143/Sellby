/* ===================================================== */
/*              SELLBY POST-OTHERS.JS                    */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { t, getTranslations, initTranslations } from "./i18n.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const CLOUD_NAME = "onrnn2hn";
const UPLOAD_PRESET = "mvrproperties";

const publishBtn = document.getElementById("publishBtn");
const photosInput = document.getElementById("photos");
const imageGrid = document.getElementById("imageGrid");
const currentImgCount = document.getElementById("currentImgCount");
const addImgHeaderBtn = document.getElementById("addImgHeaderBtn");
const statusMessage = document.getElementById("statusMessage");
const saveDraftBtn = document.getElementById("saveDraftBtn");

let selectedFiles = [];
const MAX_IMAGES = 10;

function localizeUI() {
    initTranslations();
}

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

if (publishBtn) {
    publishBtn.addEventListener("click", async () => {
        if (!auth.currentUser) {
            alert(t('login_first') || "Please login first.");
            window.location.href = "login.html";
            return;
        }

        const title = getFieldValue("title");
        const price = getFieldValue("price");
        const location = getFieldValue("location");
        const description = getFieldValue("description");

        if (selectedFiles.length === 0 || !title || !price) {
            alert(t('identity_required') || "1 Photo + Price + Title required.");
            return;
        }

        publishBtn.disabled = true;
        publishBtn.textContent = "⏳ Uploading...";
        if (statusMessage) {
            statusMessage.textContent = "Uploading images... Please wait.";
            statusMessage.style.color = "#6d28d9";
        }

        try {
            const imageUrls = [];
            for (const file of selectedFiles) {
                if (statusMessage) {
                    statusMessage.textContent = `Uploading image ${imageUrls.length + 1} of ${selectedFiles.length}...`;
                }
                const url = await uploadToCloudinary(file);
                imageUrls.push(url);
            }

            if (statusMessage) {
                statusMessage.textContent = "Finalizing ad... Do not close the app.";
            }

            const docData = {
                category: "others",
                sellerId: auth.currentUser.uid,
                sellerEmail: auth.currentUser.email || "",
                title,
                itemCategory: getFieldValue("category"),
                condition: getFieldValue("condition"),
                brand: getFieldValue("brand"),
                quantity: Number(getFieldValue("quantity") || 1),
                price: Number(price),
                location,
                description,
                imageUrls,
                status: "published",
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "ads"), docData);

            if (statusMessage) {
                statusMessage.textContent = "Published successfully!";
                statusMessage.style.color = "#16a34a";
            }
            publishBtn.textContent = "Published!";

            alert("Success: Your item ad is now live!");
            window.location.href = "others.html";
        } catch (error) {
            console.error("Publish Error:", error);
            alert(`Failed to publish: ${error.message}`);
            if (statusMessage) {
                statusMessage.textContent = "❌ Error: " + error.message;
                statusMessage.style.color = "#dc2626";
            }
            publishBtn.disabled = false;
            publishBtn.textContent = "Publish Item";
        }
    });
}

if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
        const draft = {
            title: getFieldValue("title"),
            category: getFieldValue("category"),
            condition: getFieldValue("condition"),
            price: getFieldValue("price"),
            location: getFieldValue("location"),
            description: getFieldValue("description")
        };
        localStorage.setItem("others_ad_draft", JSON.stringify(draft));
        alert("Item draft saved locally!");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    localizeUI();
    renderPreview();
});
