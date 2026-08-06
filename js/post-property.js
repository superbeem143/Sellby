/* ===================================================== */
/*              SELLBY POST-PROPERTY.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */

import { db } from "./firebase-config.js";

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

photosInput.addEventListener("change", () => {

    selectedFiles =
        Array.from(photosInput.files)
        .slice(0, MAX_IMAGES);

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

            throw new Error(errorText);

        }

        const data = await response.json();

        uploadedUrls.push(data.secure_url);

    }

    return uploadedUrls;

}

function getFieldValue(id) {

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";

}

publishBtn.addEventListener("click", async () => {

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

        await addDoc(

            collection(db, "ads"),

            {

                category: "property",

                title,

                price: Number(price),

                type,

                location,

                description,

                imageUrls,

                status: "available",

                createdAt: serverTimestamp()

            }

        );

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