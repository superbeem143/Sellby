/* ===================================================== */
/*                  SELLBY ADMIN.JS                      */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : admin.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Admin Authentication
*/
/* ===================================================== */

import {

    auth,

    db

} from "./firebase-config.js";

import {

    collection,

    getDocs

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const totalUsers =

    document.getElementById("totalUsers");

const totalAds =

    document.getElementById("totalAds");

const totalReviews =

    document.getElementById("totalReviews");

const pendingReports =

    document.getElementById("pendingReports");

const adminSearch =

    document.getElementById("adminSearch");

const searchBtn =

    document.getElementById("searchBtn");

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

        await loadDashboard();

    } catch (error) {

        console.error("Admin verification error:", error);

        window.location.href = "index.html";

    }

});
/* ===================================================== */
/*                  SELLBY ADMIN.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : admin.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Load Dashboard Statistics
    ✔ Count Users
    ✔ Count Reviews
    ✔ Count Reports
*/
/* ===================================================== */

async function loadDashboard() {

    const usersSnapshot =

        await getDocs(

            collection(db, "users")

        );

    const reviewsSnapshot =

        await getDocs(

            collection(db, "reviews")

        );

    const reportsSnapshot =

        await getDocs(

            collection(db, "reports")

        );

    const propertySnapshot =

        await getDocs(

            collection(db, "property")

        );

    const carsSnapshot =

        await getDocs(

            collection(db, "cars")

        );

    const bikesSnapshot =

        await getDocs(

            collection(db, "bikes")

        );

    const mobilesSnapshot =

        await getDocs(

            collection(db, "mobiles")

        );

    const electronicsSnapshot =

        await getDocs(

            collection(db, "electronics")

        );

    const furnitureSnapshot =

        await getDocs(

            collection(db, "furniture")

        );

    const othersSnapshot =

        await getDocs(

            collection(db, "others")

        );

    totalUsers.textContent =

        usersSnapshot.size;

    totalReviews.textContent =

        reviewsSnapshot.size;

    pendingReports.textContent =

        reportsSnapshot.size;

    totalAds.textContent =

        propertySnapshot.size +

        carsSnapshot.size +

        bikesSnapshot.size +

        mobilesSnapshot.size +

        electronicsSnapshot.size +

        furnitureSnapshot.size +

        othersSnapshot.size;

}
/* ===================================================== */
/*                  SELLBY ADMIN.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : admin.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Admin Search
    ✔ Refresh Dashboard
    ✔ Dashboard Ready
*/
/* ===================================================== */

searchBtn.addEventListener(

    "click",

    () => {

        const keyword =

            adminSearch.value

            .trim()

            .toLowerCase();

        if (!keyword) {

            loadDashboard();

            return;

        }

        console.log(

            "Admin Search:",

            keyword

        );

    }

);

adminSearch.addEventListener(

    "keydown",

    (event) => {

        if (event.key === "Enter") {

            searchBtn.click();

        }

    }

);

document.addEventListener(

    "DOMContentLoaded",

    () => {

        console.log(

            "SELLBY Admin Dashboard Ready"

        );

    }

);