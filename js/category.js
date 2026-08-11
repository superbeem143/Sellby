/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 1                         */
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

let allAds = [];

async function loadProperties() {

    try {

        loadingMessage.style.display = "block";

        emptyState.style.display = "none";

        adsContainer.innerHTML = "";

        const q = query(
            collection(db, "ads"),
            where("category", "==", "property"),
            where("status", "in", ["published", "available"])
        );
        const snapshot = await getDocs(q);

        allAds = [];

        snapshot.forEach((doc) => {

            allAds.push({

                id: doc.id,

                ...doc.data()

            });

        });

        loadingMessage.style.display = "none";

        renderProperties(allAds);

    }

    catch (error) {

        console.error(error);

        loadingMessage.style.display = "none";

        emptyState.style.display = "block";

    }

}
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */

function renderProperties(properties) {

    adsContainer.innerHTML = "";

    adsCount.textContent =
        `${properties.length} Ads`;

    if (!properties.length) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    properties.forEach((property) => {

        const card =
            document.createElement("div");

        card.className = "ad-card";

        const image =

            property.imageUrls &&
            property.imageUrls.length

            ? property.imageUrls[0]

            : "https://via.placeholder.com/600x400?text=No+Image";

        card.innerHTML = `

            <div class="ad-image">

                <img
                src="${image}"
                alt="${property.title}">

            </div>

            <div style="padding:15px;">

                <h3>${property.title}</h3>

                <h2 style="color:#6d28d9;font-weight:800;margin:10px 0;">

                    ₹${Number(property.price).toLocaleString("en-IN")}

                </h2>

                <p>

                    📍 ${property.location}

                </p>

                <p>

                    🏠 ${property.type}

                </p>

            </div>

        `;

        card.addEventListener("click", () => {

            window.location.href =
                `property-details.html?id=${property.id}`;

        });

        adsContainer.appendChild(card);

    });

}
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */

function filterProperties() {

    const keyword =

        searchInput.value
        .trim()
        .toLowerCase();

    if (!keyword) {

        renderProperties(allAds);

        return;

    }

    const filtered = allAds.filter((property) => {

        return (

            (property.title || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (property.location || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (property.type || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (property.description || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    renderProperties(filtered);

}

document.addEventListener("DOMContentLoaded", () => {

    searchInput.addEventListener(

        "input",

        filterProperties

    );

    loadProperties();

});

console.log("SELLBY Category Ready");