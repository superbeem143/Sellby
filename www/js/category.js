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

const urlParams = new URLSearchParams(window.location.search);
const categoryType = urlParams.get("type") || "property";
const initialSearch = urlParams.get("search") || "";

async function loadProperties() {
    try {
        loadingMessage.style.display = "block";
        emptyState.style.display = "none";
        adsContainer.innerHTML = "";

        let q;
        if (initialSearch) {
            q = query(
                collection(db, "ads"),
                where("status", "in", ["published", "available"])
            );
        } else {
            q = query(
                collection(db, "ads"),
                where("category", "==", categoryType),
                where("status", "in", ["published", "available"])
            );
        }

        const snapshot = await getDocs(q);

        allAds = [];
        snapshot.forEach((doc) => {
            allAds.push({
                id: doc.id,
                ...doc.data()
            });
        });

        loadingMessage.style.display = "none";

        if (initialSearch) {
            searchInput.value = initialSearch;
            filterProperties();
        } else {
            renderProperties(allAds);
        }

    } catch (error) {
        console.error("Category load error:", error);
        loadingMessage.style.display = "none";
        emptyState.style.display = "block";
    }
}

function renderProperties(properties) {
    adsContainer.innerHTML = "";
    adsCount.textContent = `${properties.length} Ads`;

    if (!properties.length) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    properties.forEach((property) => {
        const card = document.createElement("div");
        card.className = "ad-card";

        const image = property.imageUrls && property.imageUrls.length
            ? property.imageUrls[0]
            : "images/sellby-logo.png";

        card.innerHTML = `
            <div class="ad-image">
                <img src="${image}" alt="${property.title || 'Ad Image'}">
            </div>
            <div style="padding:15px;">
                <h3>${property.title || 'Untitled Ad'}</h3>
                <h2 style="color:#6d28d9;font-weight:800;margin:10px 0;">
                    ₹${Number(property.price || 0).toLocaleString("en-IN")}
                </h2>
                <p>📍 ${property.location || 'Location'}</p>
                <p>🏷️ ${property.category || property.type || 'General'}</p>
            </div>
        `;

        card.addEventListener("click", () => {
            const targetPage = (property.category === 'property' || property.type === 'property')
                ? `property-details.html?id=${property.id}`
                : `ad-details.html?id=${property.id}`;
            window.location.href = targetPage;
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