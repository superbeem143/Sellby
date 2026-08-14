/* ===================================================== */
/*                 SELLBY CHATS.JS                       */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
import { getTranslations, t } from "./i18n.js";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const chatList = document.getElementById("chatList");
const loadingMessage = document.getElementById("loadingMessage");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

let currentUser = null;
let allChats = [];

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    localizeUI();
    loadUserChats();
});

function localizeUI() {
    const trans = getTranslations();
    const header = document.querySelector(".header");
    if (header) {
        // Preserving the emoji icon if present
        header.textContent = `💬 ${trans.my_chats}`;
    }
    if (searchInput) searchInput.placeholder = trans.search_placeholder;
}

function loadUserChats() {
    if (loadingMessage) loadingMessage.textContent = t('loading');

    const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", currentUser.uid)
    );

    onSnapshot(chatsQuery, async (snapshot) => {
        try {
            if (loadingMessage) loadingMessage.style.display = "none";
            chatList.innerHTML = "";
            allChats = [];

            if (snapshot.empty) {
                if (emptyState) {
                    const emptyTitle = emptyState.querySelector("h2") || emptyState.querySelector("h3");
                    if (emptyTitle) emptyTitle.textContent = t('no_ads_yet');
                    emptyState.style.display = "block";
                }
                return;
            }

            if (emptyState) emptyState.style.display = "none";

            const chatPromises = [];
            snapshot.forEach((chatDoc) => {
                const chat = { id: chatDoc.id, ...chatDoc.data() };
                allChats.push(chat);
                chatPromises.push(enrichChatWithAdMetadata(chat));
            });

            await Promise.all(chatPromises);

            allChats.sort((a, b) => {
                const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
                const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
                return timeB - timeA;
            });

            renderChats(allChats);
        } catch (err) {
            console.error("Snapshot processing error:", err);
        }
    }, (error) => {
        console.error("Error loading chats:", error);
        if (loadingMessage) loadingMessage.style.display = "none";
        if (emptyState) {
            emptyState.style.display = "block";
            emptyState.innerHTML = `<h3>${t('failed')}</h3>`;
        }
    });
}

async function enrichChatWithAdMetadata(chat) {
    if (!chat.adTitle && chat.adId) {
        try {
            // Simplified to only check 'ads' collection for performance
            const snap = await getDoc(doc(db, "ads", chat.adId));
            if (snap.exists()) {
                const data = snap.data();
                const image = (data.imageUrls && data.imageUrls.length)
                    ? data.imageUrls[0]
                    : (data.imageUrl || data.image || data.photo || "");
                chat.adTitle = data.title || (data.brand ? (data.brand + " " + (data.model || "")) : "Ad Details");
                chat.adPrice = data.price || 0;
                chat.adImage = image;
                chat.adLocation = data.location || "";

                // Update Firestore if local metadata was updated
                updateDoc(doc(db, "chats", chat.id), {
                    adTitle: chat.adTitle,
                    adPrice: chat.adPrice,
                    adImage: chat.adImage,
                    adLocation: chat.adLocation
                }).catch(() => {});
            }
        } catch (e) {
            console.error("Meta enrich error:", e);
        }
    }
}

function renderChats(chatsToRender) {
    chatList.innerHTML = "";

    if (!chatsToRender.length) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    chatsToRender.forEach((chat) => {
        const isUnread = (chat.unreadFor === currentUser.uid);
        const otherRole = (chat.buyerId === currentUser.uid) ? "Seller" : "Buyer";
        const adTitle = chat.adTitle || chat.title || "Ad Inquiry";
        const thumbUrl = chat.adImage || "images/sellby-logo.png";
        const priceStr = chat.adPrice ? `${t('price_symbol')}${Number(chat.adPrice).toLocaleString("en-IN")}` : "";

        const chatCard = document.createElement("div");
        chatCard.className = isUnread ? "chat-item unread" : "chat-item";
        chatCard.innerHTML = `
            <div class="avatar" style="width:55px;height:55px;border-radius:10px;overflow:hidden;background:#eee;flex-shrink:0;">
                <img src="${thumbUrl}" alt="Ad Thumbnail" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="chat-info" style="flex:1;margin-left:12px;">
                <div class="chat-name" style="font-size:15px;font-weight:700;color:#6d28d9;">${escapeHtml(adTitle)}</div>
                <div style="font-size:12px;color:#555;margin-bottom:3px;">
                    <span>${escapeHtml(priceStr)}</span> ${priceStr ? '• ' : ''}<span style="font-weight:500;color:#666;">${escapeHtml(otherRole)}</span>
                    ${chat.adLocation ? ` • 📍 ${escapeHtml(chat.adLocation)}` : ''}
                </div>
                <div class="last-message" style="${isUnread ? 'font-weight:600;color:#000;' : ''}">${escapeHtml(chat.lastMessage || "Start Conversation")}</div>
            </div>
            ${isUnread ? '<div class="unread-dot" title="Unread Message"></div>' : '<div class="chat-time">Chat</div>'}
        `;

        chatCard.addEventListener("click", () => {
            window.location.href = `chat.html?chatId=${chat.id}&adId=${chat.adId || ''}&sellerId=${chat.sellerId || ''}`;
        });

        chatList.appendChild(chatCard);
    });
}

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const queryVal = e.target.value.toLowerCase().trim();
        const filtered = allChats.filter(c => 
            (c.adTitle && c.adTitle.toLowerCase().includes(queryVal)) ||
            (c.lastMessage && c.lastMessage.toLowerCase().includes(queryVal))
        );
        renderChats(filtered);
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

console.log("SELLBY Chats Loaded");
