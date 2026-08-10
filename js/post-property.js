/* ===================================================== */
/*              SELLBY POST-PROPERTY.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */

import {
    db,
    auth
} from "./firebase-config.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const CLOUD_NAME = "onrnn2hn";
const UPLOAD_PRESET = "mvrproperties";

const publishBtn =
    document.getElementById("publishBtn");

const photosInput =
    document.getElementById("photos");

const imagePreview =
    document.getElementById("imagePreview");

const previewCount =
    document.getElementById("previewCount");

const statusMessage =
    document.getElementById("statusMessage");

let selectedFiles = [];

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function validateImageFile(file) {
    if (!file.type || !file.type.startsWith("image/")) {
        throw new Error(`Invalid file type: ${file.name}. Only images are allowed.`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${file.name}. Maximum size is 5MB.`);
    }
}

photosInput.addEventListener("change", () => {
    const rawFiles = Array.from(photosInput.files);
    const valid = [];
    for (const f of rawFiles) {
        try {
            validateImageFile(f);
            valid.push(f);
        } catch (e) {
            alert(e.message);
        }
    }
    selectedFiles = valid.slice(0, MAX_IMAGES);
    renderPreview();
});

function renderPreview() {

    imagePreview.innerHTML = "";

    selectedFiles.forEach((file) => {

        const reader =
            new FileReader();

        const thumb =
            document.createElement("div");

        thumb.className =
            "preview-thumb";

        reader.onload = (e) => {

            const img =
                document.createElement("img");

            img.src =
                e.target.result;

            thumb.appendChild(img);

        };

        reader.readAsDataURL(file);

        imagePreview.appendChild(thumb);

    });

    previewCount.textContent =
        `${selectedFiles.length} / ${MAX_IMAGES} images selected`;

}
/* ===================================================== */
/*              SELLBY POST-PROPERTY.JS                  */
/*                     JS PART 2                         */
/* ===================================================== */

async function uploadImages() {

    if (!selectedFiles.length) {

        return [];

    }

    const uploadedUrls = [];

    for (const file of selectedFiles) {

        validateImageFile(file);

        const formData = new FormData();

        formData.append("file", file);

        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

            {

                method: "POST",

                body: formData

            }

        );

        if (!response.ok) {

            const errorText = await response.text();

            console.error(errorText);

            throw new Error(`Image upload failed for ${file.name}`);

        }

        const data = await response.json();

        if (data.secure_url) {
            uploadedUrls.push(data.secure_url);
        }

    }

    return uploadedUrls;

}

function getFieldValue(id) {

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";

}

publishBtn.addEventListener("click", async () => {

    if (!auth.currentUser) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;

    }

    const title = getFieldValue("title");

    const price = getFieldValue("price");

    const type = getFieldValue("type");

    const location = getFieldValue("location");

    const description = getFieldValue("description");

    if (

        !title ||

        !price ||

        !type ||

        !location ||

        !description

    ) {

        alert("Please fill in all required fields.");

        return;

    }

    publishBtn.disabled = true;

    publishBtn.textContent = "Publishing...";

    statusMessage.textContent =

        "Uploading images and publishing your property...";
    /* ===================================================== */
/*              SELLBY POST-PROPERTY.JS                  */
/*                     JS PART 3                         */
/* ===================================================== */

    try {

        const imageUrls = await uploadImages();

        const docData = {

            category: "property",

            sellerId: auth.currentUser.uid,

            sellerEmail: auth.currentUser.email,

            title,

            price: Number(price),

            type,

            location,

            description,

            imageUrls,

            status: "published",

            createdAt: serverTimestamp()

        };

        await addDoc(collection(db, "ads"), docData);
        await addDoc(collection(db, "properties"), docData);
        await addDoc(collection(db, "property"), docData);

        alert("Property Published Successfully!");

        window.location.href =
            "category.html?type=property";

    }

    catch (error) {

        console.error(error);

        alert(

            error.message ||

            "Failed to publish property."

        );

        publishBtn.disabled = false;

        publishBtn.textContent =
            "Publish Property";

        statusMessage.textContent =
            "Publishing failed. Please try again.";

    }

});    