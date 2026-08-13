/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/* ===================================================== */

import { db } from "./firebase-config.js";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const adsContainer = document.getElementById("adsContainer");
const loadingMessage = document.getElementById("loadingMessage");
const emptyState = document.getElementById("emptyState");
const adsCount = document.getElementById("adsCount");
const searchInput = document.getElementById("searchInput");

let allAds = [];
let unsubscribe = null;

const urlParams = new URLSearchParams(window.location.search);
const categoryType = urlParams.get("type") || "property";
const initialSearch = urlParams.get("search") || "";

// Identity Resolver for consistent titles across categories
function getAdTitle(ad) {
    if (ad.title) return ad.title;
    if (ad.brand && ad.model) return `${ad.brand} ${ad.model}`;
    if (ad.brand) return ad.brand;
    if (ad.productName) return ad.productName;
    return "Untitled Ad";
}

async function startCategoryListener() {
    try {
        if (unsubscribe) unsubscribe();

        loadingMessage.style.display = "block";
        emptyState.style.display = "none";

        // Update UI Header Label
        const categoryLabels = {
            property: "Properties",
            mobile: "Mobiles",
            cars: "Cars & Bikes",
            electronics: "Electronics",
            furniture: "Furniture",
            others: "Others"
        };
        const labelElem = document.querySelector(".category-name");
        if (labelElem) labelElem.textContent = categoryLabels[categoryType] || "Browse";

        let q;
        if (initialSearch) {
            // Global search query
            q = query(
                collection(db, "ads"),
                where("status", "in", ["published", "available"]),
                orderBy("createdAt", "desc")
            );
        } else if (categoryType === "cars") {
            // Combine cars and bikes for this view
            q = query(
                collection(db, "ads"),
                where("category", "in", ["cars", "bikes"]),
                where("status", "in", ["published", "available"]),
                orderBy("createdAt", "desc")
            );
        } else {
            // Specific category filter
            q = query(
                collection(db, "ads"),
                where("category", "==", categoryType),
                where("status", "in", ["published", "available"]),
                orderBy("createdAt", "desc")
            );
        }

        unsubscribe = onSnapshot(q, (snapshot) => {
            allAds = [];
            snapshot.forEach((doc) => {
                allAds.push({ id: doc.id, ...doc.data() });
            });

            loadingMessage.style.display = "none";

            if (initialSearch) {
                if (searchInput) searchInput.value = initialSearch;
                filterAds();
            } else {
                renderAds(allAds);
            }
        }, (error) => {
            console.error("Category snapshot error:", error);
            loadingMessage.style.display = "none";
            emptyState.style.display = "block";
        });

    } catch (error) {
        console.error("Listener start error:", error);
    }
}

function renderAds(ads) {
    if (!adsContainer) return;
    adsContainer.innerHTML = "";
    if (adsCount) adsCount.textContent = `${ads.length} Ads`;

    if (!ads.length) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    ads.forEach((ad) => {
        const card = document.createElement("div");
        card.className = "ad-card";

        const image = (ad.imageUrls && ad.imageUrls.length) ? ad.imageUrls[0] : "images/sellby-logo.png";
        const title = getAdTitle(ad);

        card.innerHTML = `
            <div class="ad-image">
                <img src="${image}" alt="${escapeHtml(title)}">
            </div>
            <div style="padding:15px;">
                <h3 style="font-size:16px;font-weight:700;color:#1e293b;margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">
                    ${escapeHtml(title)}
                </h3>
                <h2 style="color:#6d28d9;font-weight:800;margin:10px 0;font-size:20px;">
                    ₹${Number(ad.price || 0).toLocaleString("en-IN")}
                </h2>
                <p style="font-size:13px;color:#64748b;margin-bottom:4px;">📍 ${escapeHtml(ad.location || 'Location N/A')}</p>
                <div style="display:inline-block;padding:4px 10px;background:#f5f3ff;color:#7c3aed;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;">
                    ${ad.category || 'General'}
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            window.location.href = `ad-details.html?id=${ad.id}`;
        });

        adsContainer.appendChild(card);
    });
}

function filterAds() {
    if (!searchInput) return;
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
        renderAds(allAds);
        return;
    }

    const filtered = allAds.filter((ad) => {
        const title = getAdTitle(ad).toLowerCase();
        const loc = (ad.location || "").toLowerCase();
        const desc = (ad.description || "").toLowerCase();
        const cat = (ad.category || "").toLowerCase();

        return title.includes(keyword) || loc.includes(keyword) || desc.includes(keyword) || cat.includes(keyword);
    });

    renderAds(filtered);
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    if (searchInput) {
        searchInput.addEventListener("input", filterAds);
    }
    startCategoryListener();
});

console.log("SELLBY Unified Category logic ready.");
