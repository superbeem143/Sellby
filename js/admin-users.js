/* ===================================================== */
/*               SELLBY ADMIN-USERS.JS                   */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : admin-users.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Load Users
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

const usersList =

    document.getElementById("usersList");

const loadingMessage =

    document.getElementById("loadingMessage");

async function loadUsers() {

    loadingMessage.style.display =

        "block";

    usersList.innerHTML = "";

    const snapshot =

        await getDocs(

            collection(db, "users")

        );

    loadingMessage.style.display =

        "none";

    snapshot.forEach((userDoc) => {

        const user =

            userDoc.data();

        const card =

            document.createElement("div");

        card.className =

            "admin-user-card";
/* ===================================================== */
/*               SELLBY ADMIN-USERS.JS                   */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : admin-users.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ User Card
    ✔ Delete User Button
    ✔ Display Users
*/
/* ===================================================== */

        card.innerHTML = `

            <div class="admin-user-info">

                <h3>

                    ${user.name || "SELLBY User"}

                </h3>

                <p>

                    ${user.email || "No Email"}

                </p>

                <small>

                    UID: ${userDoc.id}

                </small>

            </div>

            <button

                class="delete-btn"

                data-id="${userDoc.id}">

                Delete

            </button>

        `;

        usersList.appendChild(

            card

        );

    });

    document

        .querySelectorAll(".delete-btn")

        .forEach((button) => {

            button.addEventListener(

                "click",

                async () => {

                    const id =

                        button.dataset.id;

                    await deleteDoc(

                        doc(

                            db,

                            "users",

                            id

                        )

                    );

                    loadUsers();

                }

            );

        });

}
/* ===================================================== */
/*               SELLBY ADMIN-USERS.JS                   */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : admin-users.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Refresh Users
    ✔ Empty State
    ✔ Admin Users Ready
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

                loadUsers();

            } catch (error) {

                console.error("Admin verification error:", error);

                window.location.href = "index.html";

            }

        });

    }

);

function showEmptyState() {

    if (

        usersList.children.length === 0

    ) {

        usersList.innerHTML =

            `

            <div class="empty-state">

                <h2>

                    👥 No Users Found

                </h2>

                <p>

                    There are currently no registered users.

                </p>

            </div>

            `;

    }

}

window.addEventListener(

    "load",

    showEmptyState

);            