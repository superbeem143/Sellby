/* ===================================================== */
/*                  SELLBY SAVED.JS                      */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : saved.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Authentication
*/
/* ===================================================== */

import {

    auth,

    db

} from "./firebase-config.js";

import {

    collection,

    getDocs,

    query,

    where

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const savedList =

    document.getElementById("savedList");

const loadingMessage =

    document.getElementById("loadingMessage");

const emptyState =

    document.getElementById("emptyState");

auth.onAuthStateChanged(async (user) => {

    if (!user) {

        window.location.href =

            "login.html";

        return;

    }

    loadSavedAds(user.uid);

});
/* ===================================================== */
/*                  SELLBY SAVED.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : saved.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Load Saved Ads
    ✔ Build Saved Card
    ✔ Display Saved Ads
*/
/* ===================================================== */

async function loadSavedAds(userId) {

    try {

        const savedQuery = query(

            collection(db, "savedAds"),

            where("userId", "==", userId)

        );

        const snapshot =

            await getDocs(savedQuery);

        loadingMessage.style.display =

            "none";

        savedList.innerHTML = "";

        if (snapshot.empty) {

            emptyState.style.display =

                "block";

            return;

        }

        snapshot.forEach((doc) => {

            const ad = doc.data();

            const card =

                document.createElement("div");

            card.className =

                "ad-card";

            card.innerHTML = `

                <div class="ad-photo">

                    <img src="${ad.imageUrl || ""}" alt="Ad">

                </div>

                <div class="ad-details">

                    <div class="title">

                        ${ad.title}

                    </div>

                    <div class="price">

                        ₹${Number(ad.price).toLocaleString("en-IN")}

                    </div>

                    <div class="location">

                        📍 ${ad.location}

                    </div>

                </div>

            `;

            savedList.appendChild(card);

        });

    }

    catch (error) {

        console.error(error);

        loadingMessage.textContent =

            "Unable to load saved ads.";

    }

}
/* ===================================================== */
/*                  SELLBY SAVED.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : saved.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Remove Saved Ad
    ✔ Refresh List
    ✔ App Ready
*/
/* ===================================================== */

import {

    deleteDoc,

    doc

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

async function removeSavedAd(documentId) {

    try {

        await deleteDoc(

            doc(db, "savedAds", documentId)

        );

        location.reload();

    }

    catch (error) {

        console.error(error);

        alert(

            "Unable to remove saved ad."

        );

    }

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        console.log(

            "Saved Ads Ready"

        );

    }

);