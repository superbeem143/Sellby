/* ===================================================== */
/*                 SELLBY REVIEWS.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : reviews.js
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

    addDoc,

    serverTimestamp,

    query,

    orderBy,

    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const reviewsList =

    document.getElementById("reviewsList");

const reviewText =

    document.getElementById("reviewText");

const submitReviewBtn =

    document.getElementById("submitReviewBtn");

const averageRating =

    document.getElementById("averageRating");

const totalReviews =

    document.getElementById("totalReviews");

const emptyState =

    document.getElementById("emptyState");

let selectedRating = 5;

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href =

            "login.html";

        return;

    }

    loadReviews();

});
/* ===================================================== */
/*                 SELLBY REVIEWS.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : reviews.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Submit Review
    ✔ Save Review
    ✔ Real-time Reviews
*/
/* ===================================================== */

submitReviewBtn.addEventListener(

    "click",

    async () => {

        const user =

            auth.currentUser;

        const review =

            reviewText.value.trim();

        if (!review) {

            alert(

                "Please write a review."

            );

            return;

        }

        await addDoc(

            collection(db, "reviews"),

            {

                userId:

                    user.uid,

                userName:

                    user.displayName ||

                    "SELLBY User",

                rating:

                    selectedRating,

                review,

                createdAt:

                    serverTimestamp()

            }

        );

        reviewText.value = "";

    }

);

function loadReviews() {

    const reviewsQuery =

        query(

            collection(db, "reviews"),

            orderBy(

                "createdAt",

                "desc"

            )

        );

    onSnapshot(

        reviewsQuery,

        renderReviews

    );

}
/* ===================================================== */
/*                 SELLBY REVIEWS.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : reviews.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Render Reviews
    ✔ Calculate Average Rating
    ✔ Update Summary
*/
/* ===================================================== */

function renderReviews(snapshot) {

    reviewsList.innerHTML = "";

    if (snapshot.empty) {

        emptyState.style.display = "block";

        averageRating.textContent = "⭐ 0.0";

        totalReviews.textContent = "0 Reviews";

        return;

    }

    emptyState.style.display = "none";

    let total = 0;

    snapshot.forEach((doc) => {

        const review = doc.data();

        total += Number(review.rating || 0);

        const card =

            document.createElement("div");

        card.className = "review-card";

        card.innerHTML = `

            <h3>${review.userName}</h3>

            <div class="review-stars">

                ${"⭐".repeat(review.rating)}

            </div>

            <p>${review.review}</p>

            <small>

                ${review.createdAt?.toDate?.()
                    ?.toLocaleDateString() || ""}

            </small>

        `;

        reviewsList.appendChild(card);

    });

    const average =

        (total / snapshot.size).toFixed(1);

    averageRating.textContent =

        `⭐ ${average}`;

    totalReviews.textContent =

        `${snapshot.size} Reviews`;

}
/* ===================================================== */
/*                 SELLBY REVIEWS.JS                     */
/*                     JS PART 4                         */
/* ===================================================== */
/*
    File Name : reviews.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 4
    Contains  :
    ✔ Star Rating Selection
    ✔ Review Page Ready
    ✔ UI Initialization
*/
/* ===================================================== */

const stars =

    document.querySelectorAll(

        "#starRating span"

    );

stars.forEach((star) => {

    star.addEventListener(

        "click",

        () => {

            selectedRating =

                Number(

                    star.dataset.rating

                );

            stars.forEach((item) => {

                item.style.opacity =

                    Number(item.dataset.rating)

                    <= selectedRating

                    ? "1"

                    : "0.35";

            });

        }

    );

});

document.addEventListener(

    "DOMContentLoaded",

    () => {

        stars.forEach((star) => {

            star.style.opacity = "1";

        });

        console.log(

            "SELLBY Reviews Ready"

        );

    }

);