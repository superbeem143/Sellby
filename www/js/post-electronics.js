/* ===================================================== */
/*            SELLBY POST-ELECTRONICS.JS                */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : post-electronics.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ DOM Elements
    ✔ Image Selection
    ✔ Image Preview
*/
/* ===================================================== */

import { db, storage } from "./firebase-config.js";

import {
    collection,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";

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

        const reader = new FileReader();

        const thumb =
            document.createElement("div");

        thumb.className = "preview-thumb";

        reader.onload = (event) => {

            const img =
                document.createElement("img");

            img.src = event.target.result;

            thumb.appendChild(img);

        };

        reader.readAsDataURL(file);

        imagePreview.appendChild(thumb);

    });

    previewCount.textContent =
        `${selectedFiles.length} / ${MAX_IMAGES} images selected`;

}
/* ===================================================== */
/*            SELLBY POST-ELECTRONICS.JS                */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : post-electronics.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Upload Images
    ✔ Get Field Value
    ✔ Publish Validation
*/
/* ===================================================== */

async function uploadImages(productId) {

    if (!selectedFiles.length) {

        return [];

    }

    const uploadedUrls = [];

    for (const file of selectedFiles) {

        validateImageFile(file);

        const imageRef = ref(

            storage,

            `electronics/${productId}/${Date.now()}_${file.name}`

        );

        const snapshot =

            await uploadBytes(imageRef, file);

        const url =

            await getDownloadURL(snapshot.ref);

        uploadedUrls.push(url);

    }

    return uploadedUrls;

}

function getFieldValue(id) {

    const element =

        document.getElementById(id);

    return element

        ? element.value.trim()

        : "";

}

publishBtn.addEventListener("click", async () => {

    const productName = getFieldValue("productName");
    const brand = getFieldValue("brand");
    const category = getFieldValue("category");
    const condition = getFieldValue("condition");
    const price = getFieldValue("price");
    const location = getFieldValue("location");
    const warranty = getFieldValue("warranty");
    const description = getFieldValue("description");
    const contactNumber = getFieldValue("contactNumber");
    const whatsappNumber = getFieldValue("whatsappNumber");

    // MINIMUM REQUIREMENT: 1 Image + Price + Identity (Name)
    if (!selectedFiles.length) {
        alert("Please add at least one photo.");
        return;
    }
    if (!productName) {
        alert("Please enter the product name.");
        return;
    }
    if (!price) {
        alert("Please enter the price.");
        return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing...";

    statusMessage.textContent =
        "Uploading images and publishing your electronic product...";
    /* ===================================================== */
/*            SELLBY POST-ELECTRONICS.JS                */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : post-electronics.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Save Product Details
    ✔ Upload Images
    ✔ Update Firestore
    ✔ Success & Error Handling
*/
/* ===================================================== */

    try {
        const docData = {
            category: "electronics",
            sellerId: auth.currentUser.uid,
            sellerEmail: auth.currentUser.email,
            productName,
            brand,
            condition,
            price: Number(price),
            location,
            warranty,
            description,
            status: "published",
            createdAt: serverTimestamp(),
            imageUrls: []
        };

        // One Publish = One Listing (unified in 'ads' collection)
        const newProductRef = await addDoc(collection(db, "ads"), docData);

        const imageUrls = await uploadImages(newProductRef.id);

        if (imageUrls.length) {
            await updateDoc(doc(db, "ads", newProductRef.id), { imageUrls });
        }

        alert("Electronic Product Published Successfully!");
        window.location.href = "electronics.html";

    } catch (error) {

        console.error(error);

        alert("Failed to publish product. Please try again.");

        publishBtn.disabled = false;

        publishBtn.textContent = "Publish Product";

        statusMessage.textContent =

            "Try again or refresh the page.";

    }

});    