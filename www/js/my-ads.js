/* ===================================================== */
/*                 SELLBY MY-ADS.JS                      */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
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
    loadMyAds();
});

async function loadMyAds() {
    if (!myAdsList) return;
    if (loadingMessage) loadingMessage.style.display = "block";
    if (emptyState) emptyState.style.display = "none";
    myAdsList.innerHTML = "";

    try {
        const collectionsToQuery = [
            "ads",
            "properties",
            "property",
            "cars",
            "bikes",
            "mobiles",
            "electronics",
            "furniture",
            "others"
        ];

        const adMap = new Map();

        for (const colName of collectionsToQuery) {
            try {
                // Query by sellerId
                const qSeller = query(
                    collection(db, colName),
                    where("sellerId", "==", currentUser.uid)
                );
                const snapSeller = await getDocs(qSeller);
                snapSeller.forEach((docSnap) => {
                    adMap.set(docSnap.id, { id: docSnap.id, collectionName: colName, ...docSnap.data() });
                });

                // Query by userId (legacy fallback)
                const qUser = query(
                    collection(db, colName),
                    where("userId", "==", currentUser.uid)
                );
                const snapUser = await getDocs(qUser);
                snapUser.forEach((docSnap) => {
                    if (!adMap.has(docSnap.id)) {
                        adMap.set(docSnap.id, { id: docSnap.id, collectionName: colName, ...docSnap.data() });
                    }
                });
            } catch (err) {
                // Ignore collection permissions/missing errors gracefully
            }
        }

        if (loadingMessage) loadingMessage.style.display = "none";

        if (adMap.size === 0) {
            if (emptyState) emptyState.style.display = "block";
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        adMap.forEach((ad) => {
            const card = document.createElement("div");
            card.className = "my-ad-card";
            card.style.cssText = "background:#fff;padding:15px;border-radius:12px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.08);display:flex;gap:15px;align-items:center;cursor:pointer;position:relative;";
            
            // Resolve uploaded image
            const thumbUrl = (ad.imageUrls && ad.imageUrls.length) 
                ? ad.imageUrls[0] 
                : (ad.imageUrl || ad.image || ad.photo || "https://via.placeholder.com/100x100?text=No+Image");

            card.innerHTML = `
                <div class="my-ad-photo" style="width:85px;height:85px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#eee;">
                    <img src="${thumbUrl}" alt="${escapeHtml(ad.title)}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div class="my-ad-info" style="flex:1;">
                    <h3 style="margin-bottom:4px;font-size:16px;color:#6d28d9;font-weight:700;">${escapeHtml(ad.title || "Untitled Listing")}</h3>
                    <p style="color:#333;font-size:14px;font-weight:600;">₹${Number(ad.price || 0).toLocaleString("en-IN")}</p>
                    <p style="color:#666;font-size:13px;margin-top:2px;">📍 ${escapeHtml(ad.location || "Location N/A")}</p>
                    <p style="color:#888;font-size:12px;margin-top:2px;">Status: <strong>${escapeHtml(ad.status || "published")}</strong></p>
                </div>
                <div class="my-ad-actions" style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;margin-left:10px;" onclick="event.stopPropagation()">
                    <select class="status-select" data-col="${ad.collectionName}" data-id="${ad.id}" style="padding:6px 8px;border-radius:8px;border:1px solid #ddd;font-size:12px;" onclick="event.stopPropagation()" onchange="event.stopPropagation()">
                        <option value="published" ${ad.status === 'published' ? 'selected' : ''}>Published</option>
                        <option value="draft" ${ad.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="reserved" ${ad.status === 'reserved' ? 'selected' : ''}>Reserved</option>
                        <option value="sold" ${ad.status === 'sold' ? 'selected' : ''}>Sold</option>
                        <option value="expired" ${ad.status === 'expired' ? 'selected' : ''}>Expired</option>
                    </select>
                    <button class="delete-ad-btn" data-col="${ad.collectionName}" data-id="${ad.id}" style="background:#ff4d4d;color:#fff;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:12px;" onclick="event.stopPropagation()">Delete</button>
                </div>
            `;

            // Whole card click handler using exact real ad.id
            card.addEventListener("click", (e) => {
                if (e.target.closest(".status-select") || e.target.closest(".delete-ad-btn")) {
                    return;
                }
                const targetId = ad.id;
                const targetCol = ad.collectionName;
                window.location.href = `ad-details.html?id=${targetId}&col=${targetCol}`;
            });

            myAdsList.appendChild(card);
        });

        // Event listeners for status updates
        document.querySelectorAll(".status-select").forEach((select) => {
            select.addEventListener("change", async (e) => {
                e.stopPropagation();
                const newStatus = e.target.value;
                const adId = e.target.dataset.id;
                const colName = e.target.dataset.col || "ads";
                try {
                    await updateDoc(doc(db, colName, adId), { status: newStatus });
                    alert(`Listing status updated to ${newStatus}`);
                    loadMyAds();
                } catch (err) {
                    console.error("Status update failed:", err);
                    alert("Could not update status.");
                }
            });
        });

        // Event listeners for deletion
        document.querySelectorAll(".delete-ad-btn").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const adId = e.target.dataset.id;
                const colName = e.target.dataset.col || "ads";
                if (confirm("Are you sure you want to delete this listing?")) {
                    try {
                        await deleteDoc(doc(db, colName, adId));
                        loadMyAds();
                    } catch (err) {
                        console.error("Deletion failed:", err);
                        alert("Could not delete listing.");
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error loading user listings:", error);
        if (loadingMessage) loadingMessage.style.display = "none";
        if (emptyState) emptyState.style.display = "block";
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

console.log("SELLBY My-Ads Visual Cards Handler Ready");
