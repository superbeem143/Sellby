/* ===================================================== */
/*                SELLBY POST-BIKE.JS                    */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : post-bike.js
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

import { db, storage, auth } from "./firebase-config.js";

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
/*                SELLBY POST-BIKE.JS                    */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : post-bike.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Upload Images
    ✔ Get Field Value
    ✔ Publish Validation
*/
/* ===================================================== */

async function uploadImages(bikeId) {

    if (!selectedFiles.length) {

        return [];

    }

    const uploadedUrls = [];

    for (const file of selectedFiles) {

        validateImageFile(file);

        const imageRef = ref(

            storage,

            `bikes/${bikeId}/${Date.now()}_${file.name}`

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

    const brand = getFieldValue("brand");
    const model = getFieldValue("model");
    const year = getFieldValue("year");
    const fuel = getFieldValue("fuel");
    const kms = getFieldValue("kms");
    const price = getFieldValue("price");
    const location = getFieldValue("location");
    const description = getFieldValue("description");
    const contactNumber = getFieldValue("contactNumber");
    const whatsappNumber = getFieldValue("whatsappNumber");

    // MINIMUM REQUIREMENT: 1 Image + Price + Identity (Brand/Model)
    if (!selectedFiles.length) {
        alert("Please add at least one photo of the bike.");
        return;
    }
    if (!brand || !model) {
        alert("Please enter the bike brand and model.");
        return;
    }
    if (!price) {
        alert("Please enter the price.");
        return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = "Publishing...";

    statusMessage.textContent =
        "Uploading images and publishing your bike ad...";
/* ===================================================== */
/*                SELLBY POST-BIKE.JS                    */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : post-bike.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Save Bike Details
    ✔ Upload Images
    ✔ Update Firestore
    ✔ Success & Error Handling
*/
/* ===================================================== */

    try {
        const docData = {
            category: "bikes",
            sellerId: auth.currentUser.uid,
            sellerEmail: auth.currentUser.email,
            brand,
            model,
            year: Number(year),
            fuel,
            kms: Number(kms),
            price: Number(price),
            location,
            description,
            status: "published",
            createdAt: serverTimestamp(),
            imageUrls: []
        };

        // One Publish = One Listing (unified in 'ads' collection)
        const newBikeRef = await addDoc(collection(db, "ads"), docData);

        const imageUrls = await uploadImages(newBikeRef.id);

        if (imageUrls.length) {
            await updateDoc(doc(db, "ads", newBikeRef.id), { imageUrls });
        }

        alert("Bike Published Successfully!");
        window.location.href = "bikes.html";

    } catch (error) {

        console.error(error);

        alert("Failed to publish bike. Please try again.");

        publishBtn.disabled = false;

        publishBtn.textContent = "Publish Bike";

        statusMessage.textContent =

            "Try again or refresh the page.";

    }

});        