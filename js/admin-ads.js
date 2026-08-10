/* ===================================================== */
/*                 SELLBY ADMIN-ADS.JS                   */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : admin-ads.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Load All Ads
*/
/* ===================================================== */

import {

    auth,

    db

} from "./firebase-config.js";

import {

    collection,

    getDocs,

    deleteDoc,

    doc

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const adsList =

    document.getElementById("adsList");

const loadingMessage =

    document.getElementById("loadingMessage");

const categories = [

    "property",

    "cars",

    "bikes",

    "mobiles",

    "electronics",

    "furniture",

    "others"

];

async function loadAds() {

    loadingMessage.style.display =

        "block";

    adsList.innerHTML = "";

    for (const category of categories) {

        const snapshot =

            await getDocs(

                collection(

                    db,

                    category

                )

            );

        snapshot.forEach((adDoc) => {

            const ad =

                adDoc.data();

            const card =

                document.createElement("div");

            card.className =

                "admin-ad-card";
/* ===================================================== */
/*                 SELLBY ADMIN-ADS.JS                   */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : admin-ads.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Ad Card
    ✔ Delete Ad Button
    ✔ Display Ads
*/
/* ===================================================== */

            card.innerHTML = `

                <div class="admin-ad-photo">

                    <img

                        src="${ad.imageUrls?.[0] || ""}"

                        alt="${ad.title}">

                </div>

                <div class="admin-ad-info">

                    <h3>

                        ${ad.title || "Untitled Ad"}

                    </h3>

                    <p>

                        ₹${Number(

                            ad.price || 0

                        ).toLocaleString("en-IN")}

                    </p>

                    <small>

                        ${category.toUpperCase()}

                    </small>

                </div>

                <button

                    class="delete-btn"

                    data-category="${category}"

                    data-id="${adDoc.id}">

                    Delete

                </button>

            `;

            adsList.appendChild(card);

        });

    }

    loadingMessage.style.display =

        "none";

    document

        .querySelectorAll(".delete-btn")

        .forEach((button) => {

            button.addEventListener(

                "click",

                async () => {

                    await deleteDoc(

                        doc(

                            db,

                            button.dataset.category,

                            button.dataset.id

                        )

                    );

                    loadAds();

                }

            );

        });

}
/* ===================================================== */
/*                 SELLBY ADMIN-ADS.JS                   */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : admin-ads.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Refresh Ads
    ✔ Empty State
    ✔ Admin Ads Ready
*/
/* ===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        auth.onAuthStateChanged(async (user) => {

            if (!user) {

                window.location.href = "login.html";

                return;

            }

            try {

                const tokenResult = await user.getIdTokenResult(true);

                if (!tokenResult.claims.admin) {

                    alert("Access Denied: Administrator privileges required.");

                    window.location.href = "index.html";

                    return;

                }

                loadAds();

            } catch (error) {

                console.error("Admin verification error:", error);

                window.location.href = "index.html";

            }

        });

    }

);

function showEmptyState() {

    if (

        adsList.children.length === 0

    ) {

        adsList.innerHTML =

            `

            <div class="empty-state">

                <h2>

                    📦 No Ads Found

                </h2>

                <p>

                    There are currently no ads available.

                </p>

            </div>

            `;

    }

}

window.addEventListener(

    "load",

    showEmptyState

);                
