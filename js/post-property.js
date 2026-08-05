/* ===================================================== */
/*              SELLBY POST-PROPERTY.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : post-property.js
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

const publishBtn = document.getElementById("publishBtn");

const photosInput = document.getElementById("photos");

const imagePreview = document.getElementById("imagePreview");

const previewCount = document.getElementById("previewCount");

const statusMessage = document.getElementById("statusMessage");

let selectedFiles = [];

const MAX_IMAGES = 10;

photosInput.addEventListener("change", () => {

  selectedFiles =
    Array.from(photosInput.files).slice(0, MAX_IMAGES);

  renderPreview();

});

function renderPreview() {

  imagePreview.innerHTML = "";

  selectedFiles.forEach((file) => {

    const reader = new FileReader();

    const thumb = document.createElement("div");

    thumb.className = "preview-thumb";

    reader.onload = (event) => {

      const img = document.createElement("img");

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
/*              SELLBY POST-PROPERTY.JS                  */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : post-property.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Upload Images
    ✔ Get Field Value
    ✔ Publish Button (Start)
*/
/* ===================================================== */

async function uploadImages(propertyId) {

  if (!selectedFiles.length) {

    return [];

  }

  const uploadedUrls = [];

  for (const file of selectedFiles) {

    const imageRef = ref(
      storage,
      `properties/${propertyId}/${Date.now()}_${file.name}`
    );

    const snapshot = await uploadBytes(imageRef, file);

    const url = await getDownloadURL(snapshot.ref);

    uploadedUrls.push(url);

  }

  return uploadedUrls;

}

function getFieldValue(id) {

  const element = document.getElementById(id);

  return element
    ? element.value.trim()
    : "";

}

publishBtn.addEventListener("click", async () => {

  const title = getFieldValue("title");

  const price = getFieldValue("price");

  const type = getFieldValue("type");

  const location = getFieldValue("location");

  const description = getFieldValue("description");

  const contactNumber = getFieldValue("contactNumber");

  const whatsappNumber = getFieldValue("whatsappNumber");

  if (
    !title ||
    !price ||
    !type ||
    !location ||
    !description ||
    !contactNumber
  ) {

    alert(
      "Please fill in all required fields before publishing."
    );

    return;

  }

  if (selectedFiles.length > MAX_IMAGES) {

    alert(`Please select up to ${MAX_IMAGES} images.`);

    return;

  }

  publishBtn.disabled = true;

  publishBtn.textContent = "Publishing...";

  statusMessage.textContent =
    "Uploading images and saving your property listing...";
