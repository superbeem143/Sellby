/* ===================================================== */
/*                  SELLBY SAVED.JS                      */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
import { t, getTranslations, initTranslations } from "./i18n.js";
import {
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const savedList = document.getElementById("savedList");
const loadingMessage = document.getElementById("loadingMessage");
const emptyState = document.getElementById("emptyState");

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    initTranslations();
    loadSavedAds(user.uid);
});

async function loadSavedAds(userId) {
    if (!savedList) return;
    try {
        if (loadingMessage) {
            loadingMessage.textContent = t('loading');
            loadingMessage.style.display = "block";
        }

        const savedQuery = query(
            collection(db, "savedAds"),
            where("userId", "==", userId)
        );

        const snapshot = await getDocs(savedQuery);
        if (loadingMessage) loadingMessage.style.display = "none";
        savedList.innerHTML = "";

        if (snapshot.empty) {
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        snapshot.forEach((docSnap) => {
            const ad = docSnap.data();
            const card = document.createElement("div");
            card.className = "ad-card";
            card.style.cursor = "pointer";

            card.innerHTML = `
                <div class="ad-image">
                    <img src="${ad.imageUrl || "images/sellby-logo.png"}" alt="Ad">
                </div>
                <div class="ad-content">
                    <div class="ad-title">${escapeHtml(ad.title)}</div>
                    <div class="ad-price">${t('price_symbol')}${Number(ad.price).toLocaleString("en-IN")}</div>
                    <div class="ad-location">📍 ${escapeHtml(ad.location)}</div>
                </div>
            `;

            card.onclick = () => {
                if(ad.adId) window.location.href = `ad-details.html?id=${ad.adId}`;
            };

            savedList.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        if (loadingMessage) loadingMessage.textContent = t('failed');
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}
