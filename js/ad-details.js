/* ===================================================== */
/*              SELLBY AD-DETAILS.JS                     */
/* ===================================================== */

import { db } from "./firebase-config.js";
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
        let adData = null;
        const collectionsToTry = targetCol 
            ? [targetCol, "ads", "properties", "property", "cars", "bikes", "mobiles", "electronics", "furniture", "others"]
            : ["ads", "properties", "property", "cars", "bikes", "mobiles", "electronics", "furniture", "others"];

        for (const colName of collectionsToTry) {
            try {
                const docRef = doc(db, colName, adId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    adData = { id: snap.id, ...snap.data() };
                    break;
                }
            } catch (e) {
                // Continue trying other collection names
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
                slider.innerHTML += `<img src="${imgUrl}" class="ad-image" alt="${escapeHtml(ad.title)}">`;
            });
        } else {
            slider.innerHTML = `<img src="https://via.placeholder.com/900x500?text=No+Image" class="ad-image" alt="No image available">`;
        }
    }

    const priceElem = document.getElementById("adPrice");
    if (priceElem) priceElem.textContent = "₹ " + Number(ad.price || 0).toLocaleString("en-IN");

    const titleElem = document.getElementById("adTitle");
    if (titleElem) titleElem.textContent = ad.title || "Untitled Listing";

    const locationElem = document.getElementById("adLocation");
    if (locationElem) locationElem.textContent = ad.location || "N/A";

    const catElem = document.getElementById("adCategory");
    if (catElem) catElem.textContent = (ad.category || ad.type || "Marketplace").toUpperCase();

    const descElem = document.getElementById("adDescription");
    if (descElem) descElem.textContent = ad.description || "No description provided.";

    const chatBtn = document.getElementById("chatBtn");
    if (chatBtn) {
        const sellerId = ad.sellerId || ad.userId;
        const existingChatId = params.get("chatId");
        
        chatBtn.addEventListener("click", () => {
            if (existingChatId) {
                window.location.href = `chat.html?chatId=${existingChatId}&adId=${ad.id}&sellerId=${sellerId || ''}`;
            } else {
                if (!sellerId) {
                    alert("Seller information is not available for this listing.");
                    return;
                }
                window.location.href = `chat.html?adId=${ad.id}&sellerId=${sellerId}`;
            }
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadAdDetails);
if (document.readyState === "interactive" || document.readyState === "complete") {
    loadAdDetails();
}

console.log("SELLBY Ad-Details Ready");
