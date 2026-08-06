/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : category.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Category Detection
*/
/* ===================================================== */

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const adsContainer =
    document.getElementById("adsContainer");

const loadingMessage =
    document.getElementById("loadingMessage");

const emptyState =
    document.getElementById("emptyState");

const adsCount =
    document.getElementById("adsCount");

const searchInput =
    document.getElementById("searchInput");

const params =
    new URLSearchParams(window.location.search);

const category =
    params.get("type") || "property";

let allAds = [];

console.log("SELLBY Category:", category);
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : category.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Load Ads From Firestore
    ✔ Filter By Category
    ✔ Display Count
*/
/* ===================================================== */

async function loadAds() {

    try {

        const adsQuery = query(

            collection(db, "ads"),

            where("category", "==", category),

            orderBy("createdAt", "desc")

        );

        const snapshot = await getDocs(adsQuery);

        loadingMessage.style.display = "none";

        allAds = [];

        adsContainer.innerHTML = "";

        if (snapshot.empty) {

            emptyState.style.display = "block";

            adsCount.textContent = "0 Ads";

            return;

        }

        snapshot.forEach((docItem) => {

            const ad = {

                id: docItem.id,

                ...docItem.data()

            };

            allAds.push(ad);

        });

        adsCount.textContent =

            `${allAds.length} Ads`;

        renderAds(allAds);

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent =

            "Failed to load ads.";

    }

}
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : category.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Render Ads
    ✔ Search
    ✔ Load Ads
*/
/* ===================================================== */

function renderAds(list) {

    adsContainer.innerHTML = "";

    if (!list.length) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    list.forEach((ad) => {

        const card = document.createElement("div");

        card.className = "ad-card";

        const image =

            ad.imageUrls && ad.imageUrls.length

            ? ad.imageUrls[0]

            : "";

        card.innerHTML = `

            <div class="ad-image">

                ${
                    image
                    ? `<img src="${image}" alt="${ad.title}">`
                    : "📷"
                }

            </div>

            <div style="padding:15px;">

                <h3>${ad.title || "No Title"}</h3>

                <h2 style="margin:8px 0;color:#0057D9;">

                    ₹${Number(ad.price || 0).toLocaleString("en-IN")}

                </h2>

                <p>📍 ${ad.location || ""}</p>

                <p>${ad.type || ""}</p>

            </div>

        `;

        card.onclick = () => {

            window.location.href =
                `property-details.html?id=${ad.id}`;

        };

        adsContainer.appendChild(card);

    });

}

searchInput.addEventListener("input", () => {

    const keyword =

        searchInput.value.toLowerCase();

    const filtered = allAds.filter((ad) =>

        (ad.title || "")
            .toLowerCase()
            .includes(keyword)

        ||

        (ad.location || "")
            .toLowerCase()
            .includes(keyword)

    );

    adsCount.textContent =

        `${filtered.length} Ads`;

    renderAds(filtered);

});

loadAds();