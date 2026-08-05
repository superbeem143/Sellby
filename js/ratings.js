/* ===================================================== */
/*                 SELLBY RATINGS.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : ratings.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Rating Initialization
*/
/* ===================================================== */

import {

    db

} from "./firebase-config.js";

import {

    collection,

    query,

    where,

    getDocs

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const averageRating =

    document.getElementById("averageRating");

const totalReviews =

    document.getElementById("totalReviews");

const reviewsList =

    document.getElementById("reviewsList");

const sellerId =

    new URLSearchParams(

        window.location.search

    ).get("seller");

let ratingData = {

    average: 0,

    total: 0

};
/* ===================================================== */
/*                 SELLBY RATINGS.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : ratings.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Load Ratings
    ✔ Calculate Average
    ✔ Update Rating Summary
*/
/* ===================================================== */

async function loadRatings() {

    if (!sellerId) {

        averageRating.textContent =

            "⭐ 0.0";

        totalReviews.textContent =

            "0 Reviews";

        return;

    }

    const ratingsQuery = query(

        collection(db, "reviews"),

        where("sellerId", "==", sellerId)

    );

    const snapshot =

        await getDocs(ratingsQuery);

    let totalStars = 0;

    snapshot.forEach((doc) => {

        totalStars +=

            Number(doc.data().rating || 0);

    });

    ratingData.total =

        snapshot.size;

    ratingData.average =

        snapshot.size

        ? (

            totalStars /

            snapshot.size

          ).toFixed(1)

        : "0.0";

    averageRating.textContent =

        `⭐ ${ratingData.average}`;

    totalReviews.textContent =

        `${ratingData.total} Reviews`;

}
/* ===================================================== */
/*                 SELLBY RATINGS.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : ratings.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Render Rating Stars
    ✔ Refresh Ratings
    ✔ Page Ready
*/
/* ===================================================== */

function renderRatingStars(rating) {

    return "⭐".repeat(

        Math.round(Number(rating))

    );

}

function refreshRatingUI() {

    averageRating.innerHTML =

        `${renderRatingStars(

            ratingData.average

        )} (${ratingData.average})`;

    totalReviews.textContent =

        `${ratingData.total} Reviews`;

}

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await loadRatings();

        refreshRatingUI();

        console.log(

            "SELLBY Ratings Ready"

        );

    }

);