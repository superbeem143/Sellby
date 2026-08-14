/* ===================================================== */
/*              SELLBY AD-DETAILS.JS                     */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const adId = params.get("id");
const targetCol = params.get("col");

const loading = document.getElementById("loading");
const content = document.getElementById("content");
const errorBox = document.getElementById("error");

let adData = null;

async function loadAdDetails() {
    if (!adId) {
        if (loading) loading.style.display = "none";
        if (errorBox) {
            errorBox.style.display = "block";
            errorBox.innerHTML = "<h2>Listing not found.</h2>";
        }
        return;
    }

    try {
        const collectionsToTry = targetCol
            ? [targetCol, "ads", "properties", "property", "cars", "bikes", "mobiles", "electronics", "furniture", "others"]
            : ["ads", "properties", "property", "cars", "bikes", "mobiles", "electronics", "furniture", "others"];

        for (const colName of collectionsToTry) {
            try {
                const docRef = doc(db, colName, adId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    adData = { id: snap.id, collectionName: colName, ...snap.data() };
                    break;
                }
            } catch (e) {
                console.warn(`Could not find in ${colName}`);
            }
        }

        if (loading) loading.style.display = "none";

        if (!adData) {
            if (errorBox) {
                errorBox.style.display = "block";
                errorBox.innerHTML = "<h2>Listing not found.</h2>";
            }
            return;
        }

        renderAd(adData);
    } catch (error) {
        console.error("Error loading ad details:", error);
        if (loading) loading.style.display = "none";
        if (errorBox) {
            errorBox.style.display = "block";
            errorBox.innerHTML = "<h2>Failed to load listing.</h2>";
        }
    }
}

function renderAd(ad) {
    if (content) content.style.display = "block";

    const slider = document.getElementById("imageSlider");
    if (slider) {
        slider.innerHTML = "";
        if (ad.imageUrls && ad.imageUrls.length) {
            ad.imageUrls.forEach((imgUrl) => {
                const img = document.createElement("img");
                img.src = imgUrl;
                img.className = "ad-main-image";
                img.alt = ad.title || "Ad Image";
                slider.appendChild(img);
            });
        } else {
            slider.innerHTML = `<img src="https://via.placeholder.com/900x500?text=No+Image" class="ad-main-image" alt="No image available">`;
        }
    }

    const priceElem = document.getElementById("adPrice");
    if (priceElem) priceElem.textContent = "₹ " + Number(ad.price || 0).toLocaleString("en-IN");

    const titleElem = document.getElementById("adTitle");
    if (titleElem) titleElem.textContent = ad.title || ad.brand + " " + (ad.model || "") || "Untitled Listing";

    const locationElem = document.getElementById("adLocation");
    if (locationElem) locationElem.textContent = ad.location || "Location N/A";

    const catElem = document.getElementById("adCategory");
    if (catElem) catElem.textContent = (ad.category || ad.type || "Marketplace").toUpperCase();

    const descElem = document.getElementById("adDescription");
    if (descElem) descElem.textContent = ad.description || "No description provided.";

    const chatBtn = document.getElementById("chatBtn");
    if (chatBtn) {
        // Wait for Auth to be ready before deciding to show/hide the chat button
        auth.onAuthStateChanged((user) => {
            const sellerId = ad.sellerId || ad.userId;

            if (user && user.uid === sellerId) {
                chatBtn.style.display = "none";
            } else {
                chatBtn.style.display = "block";

                // Remove any previous listener to be safe
                const newBtn = chatBtn.cloneNode(true);
                chatBtn.parentNode.replaceChild(newBtn, chatBtn);

                newBtn.addEventListener("click", () => {
                    if (!sellerId) {
                        alert("Seller information is not available for this listing.");
                        return;
                    }
                    // Navigate to chat
                    window.location.href = `chat.html?adId=${ad.id}&sellerId=${sellerId}`;
                });
            }
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

// Ensure execution happens only once
if (!window.adDetailsLoaded) {
    window.adDetailsLoaded = true;
    document.addEventListener("DOMContentLoaded", loadAdDetails);
    if (document.readyState === "interactive" || document.readyState === "complete") {
        loadAdDetails();
    }
}
