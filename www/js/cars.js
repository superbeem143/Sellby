/* ===================================================== */
/*                  SELLBY CARS.JS                       */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : cars.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Price Formatter
    ✔ Car Card (Start)
*/
/* ===================================================== */

import { db, auth } from "./firebase-config.js";

import {

    collection,

    getDocs,

    query,

    where,

    orderBy,

    limit

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const carList =

    document.getElementById("carList");

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

function buildCarCard(car) {

    const card =

        document.createElement("div");

    card.className = "ad-card";

    const photo =

        document.createElement("div");

    photo.className = "ad-photo";

    const imageUrl =

        Array.isArray(car.imageUrls) &&

        car.imageUrls.length > 0

            ? car.imageUrls[0]

            : null;

    if (imageUrl) {

        const img =

            document.createElement("img");

        img.src = imageUrl;

        img.alt =

            car.brand + " " + car.model;

        photo.appendChild(img);

    }

    else {

        photo.textContent = "🚗";

    }

    const details =

        document.createElement("div");

    details.className = "ad-details";
 /* ===================================================== */
/*                  SELLBY CARS.JS                       */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : cars.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Car Card (Continue)
    ✔ Car Details
    ✔ WhatsApp Button
    ✔ Return Car Card
*/
/* ===================================================== */

    const title =

        document.createElement("div");

    title.className = "title";

    title.textContent =

        `${car.brand} ${car.model}`;

    const price =

        document.createElement("div");

    price.className = "price";

    price.textContent =

        formatPrice(car.price);

    const location =

        document.createElement("div");

    location.className = "location";

    location.textContent =

        `📍 ${car.location || "Unknown Location"}`;

    const metaList =

        document.createElement("div");

    metaList.className = "meta-list";

    const yearChip =

        document.createElement("span");

    yearChip.className = "meta-chip";

    yearChip.textContent =

        `📅 ${car.year}`;

    metaList.appendChild(yearChip);

    const fuelChip =

        document.createElement("span");

    fuelChip.className = "meta-chip";

    fuelChip.textContent =

        `⛽ ${car.fuel}`;

    metaList.appendChild(fuelChip);

    const kmChip =

        document.createElement("span");

    kmChip.className = "meta-chip";

    kmChip.textContent =

        `🛣️ ${car.kms} KM`;

    metaList.appendChild(kmChip);

    const whatsappLink =
        document.createElement("a");

    const user = auth.currentUser;
    const sellerId = car.userId || car.sellerId || '';

    if (user && user.uid === sellerId) {
        whatsappLink.style.display = "none";
    }

    whatsappLink.className =
        "whatsapp-link";

    whatsappLink.href =
        `chat.html?adId=${car.id}&sellerId=${sellerId}`;

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
/*                  SELLBY CARS.JS                       */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : cars.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Load Cars
    ✔ Firestore Query
    ✔ Display Cars
    ✔ Error Handling
    ✔ App Start
*/
/* ===================================================== */

async function loadCars() {
    try {
        const carsQuery = query(
            collection(db, "ads"),
            where("category", "in", ["cars", "bikes"]),
            where("status", "in", ["published", "available"]),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const snapshot = await getDocs(carsQuery);
        carList.innerHTML = "";

        if (snapshot.empty) {
            loadingMessage.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        loadingMessage.style.display = "none";

        snapshot.forEach((docSnapshot) => {
            const data = {
                id: docSnapshot.id,
                ...docSnapshot.data()
            };
            carList.appendChild(buildCarCard(data));
        });

    } catch (error) {
        console.error("Error loading cars:", error);
        loadingMessage.textContent = "Unable to load cars. Please try again later.";
    }
}

loadCars();   