/* ===================================================== */
/*                SELLBY PROPERTY.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : property.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Price Formatter
    ✔ Property Card (Start)
*/
/* ===================================================== */

import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const propertyList = document.getElementById("propertyList");

const loadingMessage = document.getElementById("loadingMessage");

function formatPrice(value) {

  if (!value && value !== 0) return "N/A";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));

}

function buildPropertyCard(property) {

  const card = document.createElement("div");

  card.className = "ad-card";

  const photo = document.createElement("div");

  photo.className = "ad-photo";

  const imageUrl =
    Array.isArray(property.imageUrls) &&
    property.imageUrls.length > 0
      ? property.imageUrls[0]
      : null;

  if (imageUrl) {

    const img = document.createElement("img");

    img.src = imageUrl;

    img.alt = property.title || "Property image";

    photo.appendChild(img);

  } else {

    photo.textContent = "📷";

  }

  const details = document.createElement("div");

  details.className = "ad-details";

  const title = document.createElement("div");

  title.className = "title";

  title.textContent = property.title || "Untitled Property";

  const price = document.createElement("div");

  price.className = "price";

  price.textContent = formatPrice(property.price);
 /* ===================================================== */
/*                SELLBY PROPERTY.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : property.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Property Card (Continue)
    ✔ Meta Information
    ✔ WhatsApp Button
    ✔ Return Property Card
*/
/* ===================================================== */

  const location = document.createElement("div");

  location.className = "location";

  location.textContent =
    `📍 ${property.location || "Unknown location"}`;

  const metaList = document.createElement("div");

  metaList.className = "meta-list";

  if (property.propertyType) {

    const typeChip = document.createElement("span");

    typeChip.className = "meta-chip";

    typeChip.textContent = property.propertyType;

    metaList.appendChild(typeChip);

  }

  if (property.description) {

    const descChip = document.createElement("span");

    descChip.className = "meta-chip";

    descChip.textContent =
      `${property.description.substring(0,45)}${
        property.description.length > 45 ? "..." : ""
      }`;

    metaList.appendChild(descChip);

  }

  const whatsappNumber =
    property.whatsappNumber ||
    property.contactNumber ||
    "";

  const whatsappLink = document.createElement("a");

  whatsappLink.className = "whatsapp-link";

  whatsappLink.href =
    whatsappNumber
      ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g,"")}`
      : "#";

  whatsappLink.target = "_blank";

  whatsappLink.rel = "noopener noreferrer";

  whatsappLink.textContent = "WhatsApp Seller";

  details.appendChild(title);

  details.appendChild(price);

  details.appendChild(location);

  details.appendChild(metaList);

  details.appendChild(whatsappLink);

  card.appendChild(photo);

  card.appendChild(details);

  return card;

}
