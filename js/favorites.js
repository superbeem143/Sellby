/* ===================================================== */
/*                SELLBY FAVORITES.JS                    */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : favorites.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ Authentication
    ✔ Save Favorite
*/
/* ===================================================== */

import {

    auth,

    db

} from "./firebase-config.js";

import {

    addDoc,

    collection,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

export async function saveFavorite(adData) {

    const user =

        auth.currentUser;

    if (!user) {

        alert(

            "Please login to save ads."

        );

        window.location.href =

            "login.html";

        return;

    }

    await addDoc(

        collection(db, "savedAds"),

        {

            userId: user.uid,

            adId: adData.adId,

            category: adData.category,

            title: adData.title,

            price: adData.price,

            location: adData.location,

            imageUrl: adData.imageUrl || "",

            createdAt:

                serverTimestamp()

        }

    );

}
/* ===================================================== */
/*                SELLBY FAVORITES.JS                    */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : favorites.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Check Favorite
    ✔ Remove Favorite
    ✔ Firestore Query
*/
/* ===================================================== */

import {

    query,

    where,

    getDocs,

    deleteDoc,

    doc

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

export async function isFavorite(adId) {

    const user = auth.currentUser;

    if (!user) return false;

    const q = query(

        collection(db, "savedAds"),

        where("userId", "==", user.uid),

        where("adId", "==", adId)

    );

    const snapshot =

        await getDocs(q);

    return !snapshot.empty;

}

export async function removeFavorite(adId) {

    const user = auth.currentUser;

    if (!user) return;

    const q = query(

        collection(db, "savedAds"),

        where("userId", "==", user.uid),

        where("adId", "==", adId)

    );

    const snapshot =

        await getDocs(q);

    for (const item of snapshot.docs) {

        await deleteDoc(

            doc(

                db,

                "savedAds",

                item.id

            )

        );

    }

}
/* ===================================================== */
/*                SELLBY FAVORITES.JS                    */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : favorites.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Toggle Favorite
    ✔ Update Heart Icon
    ✔ Export Functions
*/
/* ===================================================== */

export async function toggleFavorite(

    heartButton,

    adData

) {

    const saved =

        await isFavorite(adData.adId);

    if (saved) {

        await removeFavorite(

            adData.adId

        );

        heartButton.textContent =

            "🤍";

    }

    else {

        await saveFavorite(

            adData

        );

        heartButton.textContent =

            "❤️";

    }

}

export async function loadFavoriteIcon(

    heartButton,

    adId

) {

    const saved =

        await isFavorite(adId);

    heartButton.textContent =

        saved

            ? "❤️"

            : "🤍";

}