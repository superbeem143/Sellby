/* ===================================================== */
/*                  SELLBY SEARCH.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : search.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Search Initialization
*/
/* ===================================================== */

import {

    db

} from "./firebase-config.js";

import {

    collection,

    getDocs

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const searchInput =

    document.getElementById("searchInput");

const searchBtn =

    document.getElementById("searchBtn");

const searchResults =

    document.getElementById("searchResults");

const emptyState =

    document.getElementById("emptyState");

const categoryFilter =

    document.getElementById("categoryFilter");

const locationFilter =

    document.getElementById("locationFilter");

const minPrice =

    document.getElementById("minPrice");

const maxPrice =

    document.getElementById("maxPrice");

const sortFilter =

    document.getElementById("sortFilter");

let allResults = [];
/* ===================================================== */
/*                  SELLBY SEARCH.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : search.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Load All Ads
    ✔ Search Function
    ✔ Display Results
*/
/* ===================================================== */

async function loadAds(category = "others") {

    const snapshot =

        await getDocs(

            collection(db, category)

        );

    snapshot.forEach((doc) => {

        allResults.push({

            id: doc.id,

            category,

            ...doc.data()

        });

    });

}

async function initializeSearch() {

    await Promise.all([

        loadAds("property"),

        loadAds("cars"),

        loadAds("bikes"),

        loadAds("mobiles"),

        loadAds("electronics"),

        loadAds("furniture"),

        loadAds("others")

    ]);

}

function displayResults(results) {

    searchResults.innerHTML = "";

    emptyState.style.display =

        results.length

        ? "none"

        : "block";

    results.forEach((item) => {

        const card =

            document.createElement("div");

        card.className =

            "ad-card";

        card.innerHTML = `

            <div class="ad-photo">

                <img src="${item.imageUrls?.[0] || ""}"

                     alt="${item.title}">

            </div>

            <div class="ad-details">

                <div class="title">

                    ${item.title}

                </div>

                <div class="price">

                    ₹${Number(item.price || 0)
                        .toLocaleString("en-IN")}

                </div>

                <div class="location">

                    📍 ${item.location || ""}

                </div>

            </div>

        `;

        searchResults.appendChild(card);

    });

}
/* ===================================================== */
/*                  SELLBY SEARCH.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : search.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Search Button
    ✔ Enter Key Search
    ✔ Initialize Search
    ✔ Live Search
*/
/* ===================================================== */

function performSearch() {

    const keyword =

        searchInput.value

        .trim()

        .toLowerCase();

    const results =

        allResults.filter((item) => {

            const isPublished =

                !item.status || item.status === "published" || item.status === "available";

            const title =

                (item.title || "")

                .toLowerCase();

            const description =

                (item.description || "")

                .toLowerCase();

            return (

                isPublished &&

                (title.includes(keyword) || description.includes(keyword))

            );

        });

    displayResults(results);

}

searchBtn.addEventListener(

    "click",

    performSearch

);

searchInput.addEventListener(

    "keydown",

    (event) => {

        if (event.key === "Enter") {

            performSearch();

        }

    }

);

searchInput.addEventListener(

    "input",

    performSearch

);

initializeSearch();

