/* ===================================================== */
/*                SELLBY POST-CAR.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : post-car.js
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

photosInput.addEventListener("change", () => {

    selectedFiles =
        Array.from(photosInput.files)
        .slice(0, MAX_IMAGES);

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
/*                SELLBY POST-CAR.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : post-car.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Upload Images
    ✔ Get Field Value
    ✔ Publish Validation
*/
/* ===================================================== */

async function uploadImages(carId) {

    if (!selectedFiles.length) {

        return [];

    }

    const uploadedUrls = [];

    for (const file of selectedFiles) {

        const imageRef = ref(

            storage,

            `cars/${carId}/${Date.now()}_${file.name}`

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

    const transmission = getFieldValue("transmission");

    const kms = getFieldValue("kms");

    const price = getFieldValue("price");

    const location = getFieldValue("location");

    const description = getFieldValue("description");

    const contactNumber = getFieldValue("contactNumber");

    const whatsappNumber = getFieldValue("whatsappNumber");

    if (

        !brand ||

        !model ||

        !year ||

        !fuel ||

        !transmission ||

        !kms ||

        !price ||

        !location ||

        !description ||

        !contactNumber

    ) {

        alert("Please fill in all required fields.");

        return;

    }

    if (selectedFiles.length > MAX_IMAGES) {

        alert(`Please select up to ${MAX_IMAGES} images.`);

        return;

    }

    publishBtn.disabled = true;

    publishBtn.textContent = "Publishing...";

    statusMessage.textContent =
        "Uploading images and publishing your car ad...";
/* ===================================================== */
/*                SELLBY POST-CAR.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : post-car.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Save Car Details
    ✔ Upload Images
    ✔ Update Firestore
    ✔ Success & Error Handling
*/
/* ===================================================== */

    try {

        const newCarRef = await addDoc(

            collection(db, "cars"),

            {

                brand,

                model,

                year: Number(year),

                fuel,

                transmission,

                kms: Number(kms),

                price: Number(price),

                location,

                description,

                contactNumber,

                whatsappNumber:
                    whatsappNumber || null,

                status: "available",

                createdAt: serverTimestamp(),

                imageUrls: []

            }

        );

        const imageUrls =
            await uploadImages(newCarRef.id);

        if (imageUrls.length) {

            await updateDoc(

                doc(db, "cars", newCarRef.id),

                {

                    imageUrls

                }

            );

        }

        alert("Car Published Successfully!");

        window.location.href = "cars.html";

    }

    catch (error) {

        console.error(error);

        alert("Failed to publish car. Please try again.");

        publishBtn.disabled = false;

        publishBtn.textContent = "Publish Car";

        statusMessage.textContent =
            "Try again or refresh the page.";

    }

});        