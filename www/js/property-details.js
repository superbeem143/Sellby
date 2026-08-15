/* ===================================================== */
/*           SELLBY PROPERTY-DETAILS.JS                  */
/*                    JS PART 1                          */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const propertyId = params.get("id");

const loading =
    document.getElementById("loading");

const content =
    document.getElementById("content");

const errorBox =
    document.getElementById("error");

async function loadProperty() {

    if (!propertyId) {

        loading.style.display = "none";

        errorBox.style.display = "block";

        errorBox.innerHTML =
            "<h2 style='color:red'>Property not found.</h2>";

        return;

    }

    try {

        const propertyRef =
            doc(db, "ads", propertyId);

        const snapshot =
            await getDoc(propertyRef);

        loading.style.display = "none";

        if (!snapshot.exists()) {

            errorBox.style.display = "block";

            errorBox.innerHTML =
                "<h2 style='color:red'>Property not found.</h2>";

            return;

        }

        const property = {

            id: snapshot.id,

            ...snapshot.data()

        };
/* ===================================================== */
/*           SELLBY PROPERTY-DETAILS.JS                  */
/*                    JS PART 2                          */
/* ===================================================== */

        renderProperty(property);

    }

    catch (error) {

        console.error(error);

        loading.style.display = "none";

        errorBox.style.display = "block";

        errorBox.innerHTML =
            "<h2 style='color:red'>Failed to load property.</h2>";

    }

}

function renderProperty(property) {

    content.style.display = "block";

    const slider =
        document.getElementById("imageSlider");

    slider.innerHTML = "";

    if (
        property.imageUrls &&
        property.imageUrls.length
    ) {

        property.imageUrls.forEach((image) => {

            slider.innerHTML += `

                <img
                    src="${image}"
                    class="property-image"
                    alt="Property">

            `;

        });

    } else {

        slider.innerHTML = `

            <img
                src="https://via.placeholder.com/900x500?text=No+Image"
                class="property-image">

        `;

    }

    document.getElementById("propertyTitle").textContent =
        property.title || "";

    document.getElementById("propertyPrice").textContent =
        "₹ " + Number(property.price || 0).toLocaleString("en-IN");

    document.getElementById("propertyType").textContent =
        property.type || "";

    document.getElementById("propertyLocation").textContent =
        property.location || "";

    document.getElementById("propertyDescription").textContent =
        property.description || "";

 const chatBtn = document.getElementById("chatBtn");
 if (chatBtn) {
     auth.onAuthStateChanged((user) => {
         const sellerId = property.sellerId || property.userId;
         if (user && user.uid === sellerId) {
             chatBtn.style.display = "none";
         } else {
             chatBtn.style.display = "block";
             const existingChatId = params.get("chatId");
             chatBtn.onclick = () => {
                 if (existingChatId) {
                     window.location.href = `chat.html?chatId=${existingChatId}&adId=${property.id}&sellerId=${sellerId || ''}`;
                 } else {
                     window.location.href = `chat.html?adId=${property.id}&sellerId=${sellerId || ''}`;
                 }
             };
         }
     });
 }
       
}


/* ===================================================== */
/*           SELLBY PROPERTY-DETAILS.JS                  */
/*                    JS PART 3                          */
/* ===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadProperty();

    }

);

console.log(

    "SELLBY Property Details Ready"

);        