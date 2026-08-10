/* ===================================================== */
/*                SELLBY MOBILES.JS                      */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : mobiles.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Price Formatter
    ✔ Mobile Card (Start)
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

const mobileList =

    document.getElementById("mobileList");

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

function buildMobileCard(mobile) {

    const card =

        document.createElement("div");

    card.className = "ad-card";

    const photo =

        document.createElement("div");

    photo.className = "ad-photo";

    const imageUrl =

        Array.isArray(mobile.imageUrls) &&

        mobile.imageUrls.length > 0

            ? mobile.imageUrls[0]

            : null;

    if (imageUrl) {

        const img =

            document.createElement("img");

        img.src = imageUrl;

        img.alt =

            `${mobile.brand} ${mobile.model}`;

        photo.appendChild(img);

    }

    else {

        photo.textContent = "📱";

    }

    const details =

        document.createElement("div");

    details.className = "ad-details";
 /* ===================================================== */
/*                SELLBY MOBILES.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : mobiles.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Mobile Card (Continue)
    ✔ Mobile Details
    ✔ WhatsApp Button
    ✔ Return Mobile Card
*/
/* ===================================================== */

    const title =

        document.createElement("div");

    title.className = "title";

    title.textContent =

        `${mobile.brand} ${mobile.model}`;

    const price =

        document.createElement("div");

    price.className = "price";

    price.textContent =

        formatPrice(mobile.price);

    const location =

        document.createElement("div");

    location.className = "location";

    location.textContent =

        `📍 ${mobile.location || "Unknown Location"}`;

    const metaList =

        document.createElement("div");

    metaList.className = "meta-list";

    const ramChip =

        document.createElement("span");

    ramChip.className = "meta-chip";

    ramChip.textContent =

        `RAM: ${mobile.ram}`;

    metaList.appendChild(ramChip);

    const storageChip =

        document.createElement("span");

    storageChip.className = "meta-chip";

    storageChip.textContent =

        `Storage: ${mobile.storage}`;

    metaList.appendChild(storageChip);

    const conditionChip =

        document.createElement("span");

    conditionChip.className = "meta-chip";

    conditionChip.textContent =

        mobile.condition;

    metaList.appendChild(conditionChip);

    const whatsappLink =

        document.createElement("a");

    whatsappLink.className =

        "whatsapp-link";

    whatsappLink.href =

        mobile.whatsappNumber

        ? `https://wa.me/${mobile.whatsappNumber.replace(/[^0-9]/g,"")}`

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
/*                SELLBY MOBILES.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : mobiles.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Load Mobiles
    ✔ Firestore Query
    ✔ Display Mobiles
    ✔ Error Handling
    ✔ App Start
*/
/* ===================================================== */

async function loadMobiles() {

    try {

        const mobilesQuery = query(

            collection(db, "mobiles"),

            where("status", "in", ["published", "available"]),

            orderBy("createdAt", "desc"),

            limit(50)

        );

        const snapshot =

            await getDocs(mobilesQuery);

        mobileList.innerHTML = "";

        if (snapshot.empty) {

            loadingMessage.style.display = "none";

            emptyState.style.display = "block";

            return;

        }

        loadingMessage.style.display = "none";

        snapshot.forEach((docSnapshot) => {

            const data =

                docSnapshot.data();

            mobileList.appendChild(

                buildMobileCard(data)

            );

        });

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent =

            "Unable to load mobiles. Please try again later.";

    }

}

loadMobiles();
   