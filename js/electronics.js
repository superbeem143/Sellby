/* ===================================================== */
/*               SELLBY ELECTRONICS.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : electronics.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Price Formatter
    ✔ Electronics Card (Start)
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

const electronicsList =

    document.getElementById("electronicsList");

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

function buildElectronicsCard(product) {

    const card =

        document.createElement("div");

    card.className = "ad-card";

    const photo =

        document.createElement("div");

    photo.className = "ad-photo";

    const imageUrl =

        Array.isArray(product.imageUrls) &&

        product.imageUrls.length > 0

            ? product.imageUrls[0]

            : null;

    if (imageUrl) {

        const img =

            document.createElement("img");

        img.src = imageUrl;

        img.alt =

            product.productName;

        photo.appendChild(img);

    }

    else {

        photo.textContent = "💻";

    }

    const details =

        document.createElement("div");

    details.className = "ad-details";
/* ===================================================== */
/*               SELLBY ELECTRONICS.JS                  */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : electronics.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Electronics Card (Continue)
    ✔ Product Details
    ✔ WhatsApp Button
    ✔ Return Electronics Card
*/
/* ===================================================== */

    const title =

        document.createElement("div");

    title.className = "title";

    title.textContent =

        product.productName;

    const price =

        document.createElement("div");

    price.className = "price";

    price.textContent =

        formatPrice(product.price);

    const location =

        document.createElement("div");

    location.className = "location";

    location.textContent =

        `📍 ${product.location || "Unknown Location"}`;

    const metaList =

        document.createElement("div");

    metaList.className = "meta-list";

    const brandChip =

        document.createElement("span");

    brandChip.className = "meta-chip";

    brandChip.textContent =

        product.brand;

    metaList.appendChild(brandChip);

    const categoryChip =

        document.createElement("span");

    categoryChip.className = "meta-chip";

    categoryChip.textContent =

        product.category;

    metaList.appendChild(categoryChip);

    const conditionChip =

        document.createElement("span");

    conditionChip.className = "meta-chip";

    conditionChip.textContent =

        product.condition;

    metaList.appendChild(conditionChip);

    const whatsappLink =

        document.createElement("a");

    whatsappLink.className =

        "whatsapp-link";

    whatsappLink.href =

        product.whatsappNumber

        ? `https://wa.me/${product.whatsappNumber.replace(/[^0-9]/g,"")}`

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
/*               SELLBY ELECTRONICS.JS                  */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : electronics.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Load Electronics
    ✔ Firestore Query
    ✔ Display Products
    ✔ Error Handling
    ✔ App Start
*/
/* ===================================================== */

async function loadElectronics() {

    try {

        const electronicsQuery = query(

            collection(db, "electronics"),

            where("status", "==", "available"),

            orderBy("createdAt", "desc"),

            limit(50)

        );

        const snapshot =

            await getDocs(electronicsQuery);

        electronicsList.innerHTML = "";

        if (snapshot.empty) {

            loadingMessage.style.display = "none";

            emptyState.style.display = "block";

            return;

        }

        loadingMessage.style.display = "none";

        snapshot.forEach((docSnapshot) => {

            const data =

                docSnapshot.data();

            electronicsList.appendChild(

                buildElectronicsCard(data)

            );

        });

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent =

            "Unable to load electronic products. Please try again later.";

    }

}

loadElectronics();   