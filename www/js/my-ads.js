/* ===================================================== */
/*                 SELLBY MY-ADS.JS                      */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
import { t, getTranslations } from "./i18n.js";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const myAdsList = document.getElementById("myAdsList");
const loadingMessage = document.getElementById("loadingMessage");
const emptyState = document.getElementById("emptyState");

let currentUser = null;

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    localizeUI();
    loadMyAds();
});

function localizeUI() {
    const trans = getTranslations();
    const h1 = document.querySelector(".category-header h1");
    if (h1) h1.textContent = trans.my_ads;
}

async function loadMyAds() {
    if (!myAdsList) return;
    if (loadingMessage) {
        loadingMessage.textContent = t('loading');
        loadingMessage.style.display = "block";
    }
    if (emptyState) emptyState.style.display = "none";
    myAdsList.innerHTML = "";

    try {
        const q = query(
            collection(db, "ads"),
            where("sellerId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);

        if (loadingMessage) loadingMessage.style.display = "none";

        if (snapshot.empty) {
            if (emptyState) {
                emptyState.querySelector("h2").textContent = t('no_ads_yet');
                emptyState.style.display = "block";
            }
            return;
        }

        snapshot.forEach((docSnap) => {
            const ad = { id: docSnap.id, ...docSnap.data() };
            const card = document.createElement("div");
            card.className = "my-ad-card";
            card.style.cssText = "background:#fff;padding:15px;border-radius:12px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:flex;gap:15px;align-items:center;cursor:pointer;position:relative;";
            
            const thumbUrl = (ad.imageUrls && ad.imageUrls.length)
                ? ad.imageUrls[0] 
                : "images/sellby-logo.png";

            const title = ad.title || (ad.brand ? (ad.brand + " " + (ad.model || "")) : "Ad Details");

            card.innerHTML = `
                <div class="my-ad-photo" style="width:85px;height:85px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#eee;">
                    <img src="${thumbUrl}" alt="${escapeHtml(title)}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div class="my-ad-info" style="flex:1;">
                    <h3 style="margin-bottom:4px;font-size:16px;color:#6d28d9;font-weight:700;">${escapeHtml(title)}</h3>
                    <p style="color:#333;font-size:14px;font-weight:600;">${t('price_symbol')}${Number(ad.price || 0).toLocaleString("en-IN")}</p>
                    <p style="color:#666;font-size:13px;margin-top:2px;">📍 ${escapeHtml(ad.location || "Location N/A")}</p>
                    <p style="color:#888;font-size:12px;margin-top:2px;">Status: <strong>${escapeHtml(ad.status || "published")}</strong></p>
                </div>
                <div class="my-ad-actions" style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;margin-left:10px;" onclick="event.stopPropagation()">
                    <select class="status-select" data-id="${ad.id}" style="padding:6px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;">
                        <option value="published" ${ad.status === 'published' ? 'selected' : ''}>Published</option>
                        <option value="sold" ${ad.status === 'sold' ? 'selected' : ''}>Sold</option>
                    </select>
                    <button class="delete-ad-btn" data-id="${ad.id}" style="background:#ff4d4d;color:#fff;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;">Delete</button>
                </div>
            `;

            card.addEventListener("click", (e) => {
                if (e.target.closest(".status-select") || e.target.closest(".delete-ad-btn")) return;
                window.location.href = `ad-details.html?id=${ad.id}`;
            });

            myAdsList.appendChild(card);
        });

        // Events
        document.querySelectorAll(".status-select").forEach(sel => {
            sel.onchange = async (e) => {
                await updateDoc(doc(db, "ads", e.target.dataset.id), { status: e.target.value });
                loadMyAds();
            };
        });

        document.querySelectorAll(".delete-ad-btn").forEach(btn => {
            btn.onclick = async (e) => {
                if (confirm("Delete this ad?")) {
                    await deleteDoc(doc(db, "ads", e.target.dataset.id));
                    loadMyAds();
                }
            };
        });

    } catch (error) {
        console.error(error);
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}
