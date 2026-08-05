/* ===================================================== */
/*              SELLBY ADMIN-REPORTS.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : admin-reports.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Load Reports
*/
/* ===================================================== */

import {

    db

} from "./firebase-config.js";

import {

    collection,

    getDocs,

    updateDoc,

    deleteDoc,

    doc

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const reportsList =

    document.getElementById("reportsList");

const loadingMessage =

    document.getElementById("loadingMessage");

async function loadReports() {

    loadingMessage.style.display =

        "block";

    reportsList.innerHTML = "";

    const snapshot =

        await getDocs(

            collection(

                db,

                "reports"

            )

        );

    loadingMessage.style.display =

        "none";

    snapshot.forEach((reportDoc) => {

        const report =

            reportDoc.data();

        const card =

            document.createElement("div");

        card.className =

            "admin-report-card";
/* ===================================================== */
/*              SELLBY ADMIN-REPORTS.JS                  */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : admin-reports.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Report Card
    ✔ Mark as Resolved
    ✔ Delete Report
*/
/* ===================================================== */

        card.innerHTML = `

            <div class="admin-report-info">

                <h3>

                    ${report.reason || "No Reason"}

                </h3>

                <p>

                    ${report.description || "No Description"}

                </p>

                <small>

                    Report ID: ${reportDoc.id}

                </small>

            </div>

            <div class="admin-report-actions">

                <button

                    class="resolve-btn"

                    data-id="${reportDoc.id}">

                    Resolve

                </button>

                <button

                    class="delete-btn"

                    data-id="${reportDoc.id}">

                    Delete

                </button>

            </div>

        `;

        reportsList.appendChild(

            card

        );

    });

    document

        .querySelectorAll(".resolve-btn")

        .forEach((button) => {

            button.addEventListener(

                "click",

                async () => {

                    await updateDoc(

                        doc(

                            db,

                            "reports",

                            button.dataset.id

                        ),

                        {

                            status:

                                "resolved"

                        }

                    );

                    loadReports();

                }

            );

        });

    document

        .querySelectorAll(".delete-btn")

        .forEach((button) => {

            button.addEventListener(

                "click",

                async () => {

                    await deleteDoc(

                        doc(

                            db,

                            "reports",

                            button.dataset.id

                        )

                    );

                    loadReports();

                }

            );

        });

}
/* ===================================================== */
/*              SELLBY ADMIN-REPORTS.JS                  */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : admin-reports.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Refresh Reports
    ✔ Empty State
    ✔ Admin Reports Ready
*/
/* ===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadReports();

        console.log(

            "SELLBY Admin Reports Ready"

        );

    }

);

function showEmptyState() {

    if (

        reportsList.children.length === 0

    ) {

        reportsList.innerHTML =

            `

            <div class="empty-state">

                <h2>

                    🚩 No Reports Found

                </h2>

                <p>

                    There are currently no pending reports.

                </p>

            </div>

            `;

    }

}

window.addEventListener(

    "load",

    showEmptyState

);            