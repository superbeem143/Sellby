/* ===================================================== */
/*                  SELLBY OTHERS.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : others.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Price Formatter
    ✔ Item Card (Start)
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

const othersList =

    document.getElementById("othersList");

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

function buildItemCard(item) {

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

        photo.textContent = "📦";

    }

    const details =

        document.createElement("div");

    details.className = "ad-details";
 /* ===================================================== */
/*                  SELLBY OTHERS.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : others.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Item Card (Continue)
    ✔ Item Details
    ✔ WhatsApp Button
    ✔ Return Item Card
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

    const categoryChip =

        document.createElement("span");

    categoryChip.className = "meta-chip";

    categoryChip.textContent =

        item.category;

    metaList.appendChild(categoryChip);

    const conditionChip =

        document.createElement("span");

    conditionChip.className = "meta-chip";

    conditionChip.textContent =

        item.condition;

    metaList.appendChild(conditionChip);

    const quantityChip =

        document.createElement("span");

    quantityChip.className = "meta-chip";

    quantityChip.textContent =

        `Qty: ${item.quantity}`;

    metaList.appendChild(quantityChip);

    const whatsappLink =

        document.createElement("a");

    whatsappLink.className =

        "whatsapp-link";

    whatsappLink.href =

        `chat.html?adId=${item.id}&sellerId=${item.userId || item.sellerId || ''}`;

    whatsappLink.textContent =

        "💬 Chat with Seller";

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
/*                  SELLBY OTHERS.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : others.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Load Items
    ✔ Firestore Query
    ✔ Display Items
    ✔ Error Handling
    ✔ App Start
*/
/* ===================================================== */

async function loadItems() {

    try {

        const itemsQuery = query(

            collection(db, "others"),

            where("status", "in", ["published", "available"]),

            orderBy("createdAt", "desc"),

            limit(50)

        );

        const snapshot =

            await getDocs(itemsQuery);

        othersList.innerHTML = "";

        if (snapshot.empty) {

            loadingMessage.style.display = "none";

            emptyState.style.display = "block";

            return;

        }

        loadingMessage.style.display = "none";

        snapshot.forEach((docSnapshot) => {

            const data =

                docSnapshot.data();

            othersList.appendChild(

                buildItemCard(data)

            );

        });

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent =

            "Unable to load items. Please try again later.";

    }

}

loadItems();   