/* ===================================================== */
/*                  SELLBY HOME.JS                       */
/* ===================================================== */

import { auth, signOut, db } from "./firebase-config.js";
import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const menuBtn = document.getElementById("menuBtn") || document.querySelector(".menu-btn");
const sideMenu = document.getElementById("sideMenu");
const logoutBtn = document.getElementById("logoutBtn");
const notifyBtn = document.getElementById("notifyBtn") || document.querySelector(".notify-btn");

let activeUnreadChats = [];

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
if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim()) {
            window.location.href = `category.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}

// Voice Search Button Listener
const voiceBtn = document.querySelector(".voice-btn");
if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice search is not supported in this browser. Please type your search or use Google Chrome / Microsoft Edge.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = "en-IN";
            recognition.interimResults = false;
            recognition.continuous = false;

            if (searchInput) searchInput.placeholder = "🎤 Listening... Speak now";
            voiceBtn.style.opacity = "0.7";

            recognition.start();

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (searchInput) searchInput.value = transcript;
                window.location.href = `category.html?search=${encodeURIComponent(transcript.trim())}`;
            };

            recognition.onerror = (event) => {
                console.warn("Home voice search error:", event.error);
                if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                    alert("Microphone permission denied. Please allow microphone access in your browser settings to use Voice Search.");
                } else if (event.error === "no-speech") {
                    alert("No speech detected. Please tap microphone button and speak again.");
                }
                if (searchInput) searchInput.placeholder = "Search anything...";
                voiceBtn.style.opacity = "1";
            };

            recognition.onend = () => {
                if (searchInput) searchInput.placeholder = "Search anything...";
                voiceBtn.style.opacity = "1";
            };
        } catch (err) {
            console.error("Voice search initialization error:", err);
        }
    });
}

// Camera / Visual Search Button Listener
const cameraBtn = document.querySelector(".camera-btn");
if (cameraBtn) {
    cameraBtn.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                alert("Image uploaded for Visual Search. Redirecting to browse items...");
                window.location.href = "category.html";
            }
        };
        fileInput.click();
    });
}

auth.onAuthStateChanged((user) => {
    if (!user) {
        if (logoutBtn) {
            logoutBtn.innerHTML = '<span class="menu-icon">🔑</span> Login';
            logoutBtn.href = "login.html";
            logoutBtn.classList.remove("logout");
        }
        window.location.replace("login.html");
        return;
    }

    try {
        const unreadQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid),
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

        // If multiple unread chats, toggle notification dropdown popover
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
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(124, 58, 237, 0.15);
        border: 1px solid #f1f5f9;
        z-index: 1000;
        padding: 14px;
        font-family: 'Poppins', sans-serif;
    `;

    renderPopoverContent(popover);
    document.body.appendChild(popover);

    document.addEventListener("click", function closePopover(event) {
        if (!popover.contains(event.target) && event.target !== notifyBtn && !notifyBtn.contains(event.target)) {
            popover.style.display = "none";
        }
    });
}

function renderPopoverContent(popover) {
    let html = `<div style="font-weight:700;font-size:14px;color:#6d28d9;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
        <span>🔔 Notifications (${activeUnreadChats.length})</span>
        <a href="chats.html" style="font-size:12px;color:#db2777;text-decoration:none;font-weight:600;">View All</a>
    </div>`;

    activeUnreadChats.forEach((chat) => {
        const title = chat.adTitle || "Ad Inquiry";
        const msg = chat.lastMessage || "New message received";
        const thumb = chat.adImage || "https://via.placeholder.com/45x45?text=Ad";

        html += `
            <div class="popover-item" data-chat-id="${chat.id}" data-ad-id="${chat.adId || ''}" data-seller-id="${chat.sellerId || ''}" 
                 style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;background:#f8f9fc;margin-bottom:8px;cursor:pointer;transition:background 0.2s;">
                <img src="${thumb}" alt="Ad" style="width:42px;height:42px;border-radius:6px;object-fit:cover;flex-shrink:0;">
                <div style="flex:1;overflow:hidden;">
                    <div style="font-weight:600;font-size:13px;color:#222;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(title)}</div>
                    <div style="font-size:12px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">💬 ${escapeHtml(msg)}</div>
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

// Latest Ads implementation
async function loadLatestAds() {
    const latestAdsContainer = document.getElementById("latestAds");
    if (!latestAdsContainer) return;

    try {
        const q = query(
            collection(db, "ads"),
            where("status", "in", ["published", "available"]),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const snapshot = await getDocs(q);
        latestAdsContainer.innerHTML = "";

        if (snapshot.empty) {
            latestAdsContainer.innerHTML = `<div style="text-align:center;padding:20px;color:#64748b;">No ads published yet.</div>`;
            return;
        }

        snapshot.forEach((docSnapshot) => {
            const ad = { id: docSnapshot.id, ...docSnapshot.data() };
            const card = document.createElement("div");
            card.className = "ad-card";

            const image = (ad.imageUrls && ad.imageUrls.length) ? ad.imageUrls[0] : "images/sellby-handshake.png";

            card.innerHTML = `
                <div class="ad-image">
                    <img src="${image}" alt="${escapeHtml(ad.title || ad.brand + ' ' + ad.model)}">
                </div>
                <div class="ad-content">
                    <div class="ad-title">${escapeHtml(ad.title || ad.brand + ' ' + ad.model || ad.productName || 'Untitled')}</div>
                    <div class="ad-price">₹${Number(ad.price || 0).toLocaleString("en-IN")}</div>
                    <div class="ad-location">📍 ${escapeHtml(ad.location || 'Location N/A')}</div>
                </div>
            `;

            card.addEventListener("click", () => {
                window.location.href = `ad-details.html?id=${ad.id}`;
            });

            latestAdsContainer.appendChild(card);
        });
    } catch (error) {
        console.warn("Error loading latest ads:", error);
    }
}

// Utility to fetch latest ads on load
document.addEventListener("DOMContentLoaded", () => {
    loadLatestAds();
});

console.log("SELLBY Home Script Ready");
