/* ===================================================== */
/*                  SELLBY HOME.JS                       */
/* ===================================================== */

import { auth, signOut, db } from "./firebase-config.js";
import { getTranslations, t, initTranslations, getLanguage } from "./i18n.js";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const menuBtn = document.getElementById("menuBtn") || document.querySelector(".menu-btn");
const sideMenu = document.getElementById("sideMenu");
const logoutBtn = document.getElementById("logoutBtn");
const notifyBtn = document.getElementById("notifyBtn") || document.querySelector(".notify-btn");

let activeUnreadChats = [];

// Initialize i18n for Home
function initI18n() {
    initTranslations(); // Use the global mechanism

    // Static Labels (Logo etc)
    const logoSell = document.querySelector(".logo .sell");
    const logoBy = document.querySelector(".logo .by");
    if (logoSell) logoSell.textContent = "SELL";
    if (logoBy) logoBy.textContent = "BY";
}

if (menuBtn && sideMenu) {
    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isShowing = sideMenu.classList.toggle("show");
        if (isShowing) {
            window.location.hash = "menu";
        } else if (window.location.hash === "#menu") {
            history.back();
        }
    });

    document.addEventListener("click", (e) => {
        if (sideMenu.classList.contains("show")) {
            if (!sideMenu.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
                sideMenu.classList.remove("show");
                if (window.location.hash === "#menu") {
                    history.back();
                }
            }
        }
    });

    window.addEventListener("hashchange", () => {
        if (window.location.hash !== "#menu") {
            sideMenu.classList.remove("show");
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
    });
}

// Search input handling
const searchInput = document.getElementById("searchInput");
const searchBtnIcon = document.querySelector(".search-btn-icon");

if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim()) {
            window.location.href = `category.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}

if (searchBtnIcon && searchInput) {
    searchBtnIcon.addEventListener("click", () => {
        if (searchInput.value.trim()) {
            window.location.href = `category.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        } else {
            searchInput.focus();
        }
    });
}

// Voice Search Logic (Android Native Bridge)
const voiceSearchBtn = document.getElementById("voiceSearchBtn");

if (voiceSearchBtn) {
    // Native Callback
    window.onSpeechResults = (text) => {
        if (searchInput) {
            searchInput.value = text;
            // Auto-trigger search
            window.location.href = `category.html?search=${encodeURIComponent(text.trim())}`;
        }
    };

    window.onSpeechError = (msg) => {
        console.warn("Speech error:", msg);
        if (msg) alert(msg);
    };

    voiceSearchBtn.addEventListener("click", () => {
        if (window.AndroidSpeech) {
            const currentLang = getLanguage();
            let langCode = "en-IN";
            if (currentLang === "te") langCode = "te-IN";
            else if (currentLang === "hi") langCode = "hi-IN";

            window.AndroidSpeech.startListening(langCode);
        } else {
            console.warn("AndroidSpeech bridge not available.");
        }
    });
}

// Camera Search Fix
const cameraSearchBtn = document.getElementById("cameraSearchBtn");
if (cameraSearchBtn) {
    cameraSearchBtn.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                window.location.href = "category.html";
            }
        };
        fileInput.click();
    });
}

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.replace("login.html");
        return;
    }

    try {
        const unreadQuery = query(
            collection(db, "chats"),
            where("unreadFor", "==", user.uid)
        );

        onSnapshot(unreadQuery, (snapshot) => {
            const previousCount = activeUnreadChats.length;
            activeUnreadChats = [];
            snapshot.forEach((doc) => {
                activeUnreadChats.push({ id: doc.id, ...doc.data() });
            });

            if (activeUnreadChats.length > previousCount) {
                playNotificationSound();
            }

            updateNotificationBadge();
        }, (error) => {
            console.warn("Unread badge query notice:", error);
        });
    } catch (err) {
        console.warn("Unread notification initialization notice:", err);
    }
});

function playNotificationSound() {
    try {
        const audio = new Audio("https://firebasestorage.googleapis.com/v0/b/mvr-properties-64922.firebasestorage.app/o/sounds%2Fnotification.mp3?alt=media");
        audio.play().catch(e => console.warn("Audio play blocked by browser policy:", e));
    } catch (e) {
        console.warn("Notification sound error:", e);
    }
}

function updateNotificationBadge() {
    if (!notifyBtn) return;

    let badge = notifyBtn.querySelector(".notify-badge");
    if (activeUnreadChats.length > 0) {
        if (!badge) {
            badge = document.createElement("span");
            badge.className = "notify-badge";
            badge.style.cssText = "position:absolute;top:4px;right:4px;width:10px;height:10px;background:#db2777;border-radius:50%;border:2px solid #6d28d9;";
            notifyBtn.style.position = "relative";
            notifyBtn.appendChild(badge);
        }
        badge.style.display = "block";
    } else {
        if (badge) badge.style.display = "none";
    }
}

if (notifyBtn) {
    notifyBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if (activeUnreadChats.length === 0) {
            window.location.href = "chats.html";
            return;
        }

        if (activeUnreadChats.length === 1) {
            const chat = activeUnreadChats[0];
            window.location.href = `chat.html?chatId=${chat.id}&adId=${chat.adId || ''}&sellerId=${chat.sellerId || ''}`;
            return;
        }

        toggleNotificationPopover();
    });
}

function toggleNotificationPopover() {
    let popover = document.getElementById("notificationPopover");

    if (popover) {
        popover.style.display = (popover.style.display === "none" || !popover.style.display) ? "block" : "none";
        return;
    }

    popover = document.createElement("div");
    popover.id = "notificationPopover";
    popover.style.cssText = `
        position: absolute;
        top: 60px;
        right: 15px;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(124, 58, 237, 0.15);
        border: 1px solid #f1f5f9;
        z-index: 1000;
        padding: 12px;
    `;

    renderPopoverContent(popover);
    document.body.appendChild(popover);

    document.addEventListener("click", (event) => {
        if (!popover.contains(event.target) && event.target !== notifyBtn && !notifyBtn.contains(event.target)) {
            popover.style.display = "none";
        }
    });
}

function renderPopoverContent(popover) {
    const trans = getTranslations();
    let html = `<div style="font-weight:700;font-size:14px;color:#6d28d9;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:5px;">${trans.my_chats} (${activeUnreadChats.length})</div>`;

    activeUnreadChats.forEach((chat) => {
        const title = chat.adTitle || "Ad Inquiry";
        const msg = chat.lastMessage || "New message received";
        const thumb = chat.adImage || "images/sellby-logo.png";

        html += `
            <div class="popover-item" data-chat-id="${chat.id}" data-ad-id="${chat.adId || ''}" data-seller-id="${chat.sellerId || ''}"
                 style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;background:#f8f9fc;margin-bottom:8px;cursor:pointer;">
                <img src="${thumb}" alt="Ad" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">
                <div style="flex:1;overflow:hidden;">
                    <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
                    <div style="font-size:12px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${msg}</div>
                </div>
            </div>
        `;
    });

    popover.innerHTML = html;

    popover.querySelectorAll(".popover-item").forEach((item) => {
        item.addEventListener("click", () => {
            const chatId = item.dataset.chatId;
            const adId = item.dataset.adId;
            const sellerId = item.dataset.sellerId;
            window.location.href = `chat.html?chatId=${chatId}&adId=${adId}&sellerId=${sellerId}`;
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

function getAdTitle(ad) {
    if (ad.title) return ad.title;
    if (ad.brand && ad.model) return `${ad.brand} ${ad.model}`;
    if (ad.brand) return ad.brand;
    if (ad.productName) return ad.productName;
    return t('untitled_ad');
}

function listenToLatestAds() {
    const latestAdsContainer = document.getElementById("latestAds");
    if (!latestAdsContainer) return;

    const q = query(
        collection(db, "ads"),
        orderBy("createdAt", "desc"),
        limit(50)
    );

    onSnapshot(q, (snapshot) => {
        latestAdsContainer.innerHTML = "";

        const validAds = [];
        snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (data.status === "published" || data.status === "available") {
                validAds.push({ id: docSnapshot.id, ...data });
            }
        });

        if (validAds.length === 0) {
            latestAdsContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#64748b;grid-column:1/-1;">${t('no_ads_yet')}</div>`;
            return;
        }

        validAds.slice(0, 12).forEach((ad) => {
            const card = document.createElement("div");
            card.className = "ad-card";

            const image = (ad.imageUrls && ad.imageUrls.length) ? ad.imageUrls[0] : "images/sellby-logo.png";
            const title = getAdTitle(ad);

            card.innerHTML = `
                <div class="ad-image">
                    <img src="${image}" alt="${escapeHtml(title)}">
                </div>
                <div class="ad-content">
                    <div class="ad-title">${escapeHtml(title)}</div>
                    <div class="ad-price">${t('price_symbol')}${Number(ad.price || 0).toLocaleString("en-IN")}</div>
                    <div class="ad-location">📍 ${escapeHtml(ad.location || 'Location N/A')}</div>
                </div>
            `;

            card.addEventListener("click", () => {
                window.location.href = `ad-details.html?id=${ad.id}`;
            });

            latestAdsContainer.appendChild(card);
        });
    }, (error) => {
        console.error("Error listening to latest ads:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initI18n();
    listenToLatestAds();
});

console.log("SELLBY Home Loaded");
