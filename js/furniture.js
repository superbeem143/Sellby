/* ===================================================== */
/*                 SELLBY FURNITURE.JS                   */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : furniture.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Price Formatter
    ✔ Furniture Card (Start)
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

const furnitureList =

    document.getElementById("furnitureList");

const loadingMessage =

    document.getElementById("loadingMessage");

const emptyState =

    document.getElementById("emptyState");

function formatPrice(value) {

    if (!value && value !== 0)

        return "N/A";

    return new Intl.NumberFormat(

        "en-IN",

        {

            style: "currency",

            currency: "INR",

            maximumFractionDigits: 0

        }

    ).format(Number(value));

}

function buildFurnitureCard(item) {

    const card =

        document.createElement("div");

    card.className = "ad-card";

    const photo =

        document.createElement("div");

    photo.className = "ad-photo";

    const imageUrl =

        Array.isArray(item.imageUrls) &&

        item.imageUrls.length > 0

            ? item.imageUrls[0]

            : null;

    if (imageUrl) {

        const img =

            document.createElement("img");

        img.src = imageUrl;

        img.alt = item.title;

        photo.appendChild(img);

    }

    else {

        photo.textContent = "🪑";

    }

    const details =

        document.createElement("div");

    details.className = "ad-details";
/* ===================================================== */
/*                 SELLBY FURNITURE.JS                   */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : furniture.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Furniture Card (Continue)
    ✔ Furniture Details
    ✔ WhatsApp Button
    ✔ Return Furniture Card
*/
/* ===================================================== */

    const title =

        document.createElement("div");

    title.className = "title";

    title.textContent =

        item.title;

    const price =

        document.createElement("div");

    price.className = "price";

    price.textContent =

        formatPrice(item.price);

    const location =

        document.createElement("div");

    location.className = "location";

    location.textContent =

        `📍 ${item.location || "Unknown Location"}`;

    const metaList =

        document.createElement("div");

    metaList.className = "meta-list";

    const typeChip =

        document.createElement("span");

    typeChip.className = "meta-chip";

    typeChip.textContent =

        item.type;

    metaList.appendChild(typeChip);

    const materialChip =

        document.createElement("span");

    materialChip.className = "meta-chip";

    materialChip.textContent =

        item.material;

    metaList.appendChild(materialChip);

    const conditionChip =

        document.createElement("span");

    conditionChip.className = "meta-chip";

    conditionChip.textContent =

        item.condition;

    metaList.appendChild(conditionChip);

    const whatsappLink =

        document.createElement("a");

    whatsappLink.className =

        "whatsapp-link";

    whatsappLink.href =

        item.whatsappNumber

        ? `https://wa.me/${item.whatsappNumber.replace(/[^0-9]/g, "")}`

        : "#";

    whatsappLink.target = "_blank";

    whatsappLink.rel =

        "noopener noreferrer";

    whatsappLink.textContent =

        "WhatsApp Seller";

    details.appendChild(title);

    details.appendChild(price);

    details.appendChild(location);

    details.appendChild(metaList);

    details.appendChild(whatsappLink);

    card.appendChild(photo);

    card.appendChild(details);

    return card;

}
/* ===================================================== */
/*                 SELLBY FURNITURE.JS                   */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : furniture.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Load Furniture
    ✔ Firestore Query
    ✔ Display Furniture
    ✔ Error Handling
    ✔ App Start
*/
/* ===================================================== */

async function loadFurniture() {

    try {

        const furnitureQuery = query(

            collection(db, "furniture"),

            where("status", "in", ["published", "available"]),

            orderBy("createdAt", "desc"),

            limit(50)

        );

        const snapshot =

            await getDocs(furnitureQuery);

        furnitureList.innerHTML = "";

        if (snapshot.empty) {

            loadingMessage.style.display = "none";

            emptyState.style.display = "block";

            return;

        }

        loadingMessage.style.display = "none";

        snapshot.forEach((docSnapshot) => {

            const data =

                docSnapshot.data();

            furnitureList.appendChild(

                buildFurnitureCard(data)

            );

        });

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent =

            "Unable to load furniture. Please try again later.";

    }

}

loadFurniture();    