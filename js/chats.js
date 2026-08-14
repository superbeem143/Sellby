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
    try {
        const trans = getTranslations();
        const header = document.querySelector(".header");
        if (header) {
            header.textContent = `💬 ${trans.my_chats || "My Chats"}`;
        }
        if (searchInput) {
            searchInput.placeholder = trans.search_placeholder || "Search chats...";
        }
    } catch (e) {
        console.warn("Localization failed in chats.js:", e);
    }
}

function loadUserChats() {
    if (!currentUser) return;

    if (loadingMessage) {
        loadingMessage.textContent = t('loading') || "Loading Chats...";
        loadingMessage.style.display = "block";
    }

    try {
        // Query for chats where the current user is a participant
        const chatsQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", currentUser.uid)
        );

        onSnapshot(chatsQuery, async (snapshot) => {
            try {
                // Immediately hide loading state when we get a response
                if (loadingMessage) loadingMessage.style.display = "none";

                if (snapshot.empty) {
                    chatList.innerHTML = "";
                    if (emptyState) {
                        const emptyTitle = emptyState.querySelector("h2") || emptyState.querySelector("h3");
                        if (emptyTitle) emptyTitle.textContent = t('no_ads_yet') || "No Chats Yet";
                        emptyState.style.display = "block";
                    }
                    return;
                }

                if (emptyState) emptyState.style.display = "none";

                const newChatsList = [];
                snapshot.forEach((chatDoc) => {
                    newChatsList.push({ id: chatDoc.id, ...chatDoc.data() });
                });

                // Sort by most recent activity (updatedAt or createdAt)
                newChatsList.sort((a, b) => {
                    const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
                    const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
                    return timeB - timeA;
                });

                allChats = newChatsList;
                renderChats(allChats);

                // Perform background metadata enrichment if needed
                newChatsList.forEach(chat => {
                    // Enrich if title is missing or generic "Ad Inquiry"
                    if ((!chat.adTitle || chat.adTitle === "Ad Inquiry") && chat.adId) {
                        enrichChatWithAdMetadata(chat);
                    }
                });

            } catch (err) {
                console.error("Chats data processing error:", err);
            }
        }, (error) => {
            console.error("Chats onSnapshot error:", error);
            if (loadingMessage) {
                loadingMessage.textContent = "Connection error. Please retry.";
                loadingMessage.style.color = "#dc2626";
            }
        });
    } catch (err) {
        console.error("loadUserChats initialization error:", err);
    }
}

async function enrichChatWithAdMetadata(chat) {
    try {
        // Only try 'ads' collection as it is the unified source
        const snap = await getDoc(doc(db, "ads", chat.adId));
        if (snap.exists()) {
            const data = snap.data();
            const image = (data.imageUrls && data.imageUrls.length) ? data.imageUrls[0] : "";
            const title = data.title || (data.brand ? (data.brand + " " + (data.model || "")) : "Ad Details");

            // Update chat document in background to save meta for future quick loads
            await updateDoc(doc(db, "chats", chat.id), {
                adTitle: title,
                adPrice: data.price || 0,
                adImage: image,
                adLocation: data.location || ""
            });
            // The onSnapshot listener will trigger a re-render automatically after updateDoc
        }
    } catch (e) {
        console.warn("Failed to enrich metadata for chat:", chat.id);
    }
}

function renderChats(chatsToRender) {
    if (!chatList) return;
    chatList.innerHTML = "";

    if (!chatsToRender.length) {
        if (emptyState) emptyState.style.display = "block";
        return;
    }

    chatsToRender.forEach((chat) => {
        const isUnread = (chat.unreadFor === currentUser.uid);
        const otherRole = (chat.buyerId === currentUser.uid) ? "Seller" : "Buyer";
        const adTitle = chat.adTitle || "Ad Inquiry";
        const thumbUrl = chat.adImage || "images/sellby-logo.png";
        const priceStr = chat.adPrice ? `${t('price_symbol')}${Number(chat.adPrice).toLocaleString("en-IN")}` : "";

        const chatCard = document.createElement("div");
        chatCard.className = isUnread ? "chat-item unread" : "chat-item";

        chatCard.innerHTML = `
            <div class="avatar" style="width:55px;height:55px;border-radius:12px;overflow:hidden;background:#f1f5f9;flex-shrink:0;border:1px solid #e2e8f0;">
                <img src="${thumbUrl}" alt="Ad" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="chat-info" style="flex:1;margin-left:12px;overflow:hidden;">
                <div class="chat-name" style="font-size:15px;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(adTitle)}</div>
                <div style="font-size:12px;color:#64748b;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    <span style="font-weight:700;color:#6d28d9;">${escapeHtml(priceStr)}</span> ${priceStr ? '• ' : ''}<span style="font-weight:600;">${otherRole}</span>
                    ${chat.adLocation ? ` • 📍 ${escapeHtml(chat.adLocation)}` : ''}
                </div>
                <div class="last-message" style="font-size:13px;color:${isUnread ? '#000' : '#64748b'};font-weight:${isUnread ? '700' : '400'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${escapeHtml(chat.lastMessage || "No messages yet")}
                </div>
            </div>
            ${isUnread ? '<div class="unread-dot" style="width:10px;height:10px;background:#db2777;border-radius:50%;margin-left:8px;"></div>' : ''}
        `;

        chatCard.onclick = () => {
            window.location.href = `chat.html?chatId=${chat.id}&adId=${chat.adId || ''}&sellerId=${chat.sellerId || ''}`;
        };

        chatList.appendChild(chatCard);
    });
}

if (searchInput) {
    searchInput.oninput = (e) => {
        const queryVal = e.target.value.toLowerCase().trim();
        const filtered = allChats.filter(c => 
            (c.adTitle && c.adTitle.toLowerCase().includes(queryVal)) ||
            (c.lastMessage && c.lastMessage.toLowerCase().includes(queryVal))
        );
        renderChats(filtered);
    };
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}

console.log("SELLBY My Chats Logic Finalized and Robust");
