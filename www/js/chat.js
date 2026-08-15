/* ===================================================== */
/*                  SELLBY CHAT.JS                       */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
import { getTranslations, t, initTranslations } from "./i18n.js";
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
let activeChatId = params.get("chatId");
let adId = params.get("adId");
const sellerId = params.get("sellerId");

const sellerNameElem = document.getElementById("sellerName");
const sellerStatusElem = document.getElementById("sellerStatus");

let currentUser = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    initTranslations();
    const trans = getTranslations();
    if (sellerStatusElem) sellerStatusElem.textContent = trans.online;

    await initializeChat();
});

async function initializeChat() {
    if (activeChatId) {
        window.activeChatId = activeChatId;
        try {
            const chatSnap = await getDoc(doc(db, "chats", activeChatId));
            if (chatSnap.exists()) {
                const chatData = chatSnap.data();
                if (!adId && chatData.adId) {
                    adId = chatData.adId;
                }
                const otherRole = (chatData.buyerId === currentUser.uid) ? "Seller" : "Buyer";
                if (sellerNameElem) {
                    sellerNameElem.textContent = chatData.adTitle ? `${chatData.adTitle} (${otherRole})` : otherRole;
                }
                if (chatData.unreadFor === currentUser.uid) {
                    await updateDoc(doc(db, "chats", activeChatId), { unreadFor: "" });
                }

                await renderAdBanner(adId, chatData);
            }
        } catch (err) {
            console.error("Error initializing chat by ID:", err);
        }
        return;
    }

    if (adId && sellerId) {
        const adMeta = await fetchAdMetadata(adId);

        if (currentUser.uid === sellerId) {
            const chatsQuery = query(
                collection(db, "chats"),
                where("adId", "==", adId),
                where("sellerId", "==", sellerId)
            );
            const snapshot = await getDocs(chatsQuery);
            if (!snapshot.empty) {
                const chatDoc = snapshot.docs[0];
                activeChatId = chatDoc.id;
                window.activeChatId = activeChatId;
                if (sellerNameElem) sellerNameElem.textContent = (adMeta.title ? `${adMeta.title} (Buyer)` : "Buyer");
                if (chatDoc.data().unreadFor === currentUser.uid) {
                    await updateDoc(doc(db, "chats", activeChatId), { unreadFor: "" });
                }
                renderAdBannerWithMeta(adId, adMeta);
            } else {
                alert("Own ad chat only via My Chats.");
                window.history.back();
                return;
            }
            return;
        }

        const existingQuery = query(
            collection(db, "chats"),
            where("adId", "==", adId),
            where("buyerId", "==", currentUser.uid),
            where("sellerId", "==", sellerId)
        );

        const snapshot = await getDocs(existingQuery);

        if (!snapshot.empty) {
            const chatDoc = snapshot.docs[0];
            activeChatId = chatDoc.id;
            const existingData = chatDoc.data();
            if (existingData.unreadFor === currentUser.uid) {
                await updateDoc(doc(db, "chats", activeChatId), { unreadFor: "" });
            }
            if (!existingData.adTitle && adMeta.title) {
                await updateDoc(doc(db, "chats", activeChatId), {
                    adTitle: adMeta.title,
                    adPrice: adMeta.price,
                    adImage: adMeta.image,
                    adLocation: adMeta.location
                });
            }
        } else {
            const newChatRef = await addDoc(collection(db, "chats"), {
                adId,
                sellerId,
                buyerId: currentUser.uid,
                participants: [currentUser.uid, sellerId],
                adTitle: adMeta.title || "Ad Inquiry",
                adPrice: adMeta.price || 0,
                adImage: adMeta.image || "",
                adLocation: adMeta.location || "",
                lastMessage: "",
                lastMessageSenderId: "",
                unreadFor: "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            activeChatId = newChatRef.id;
        }

        window.activeChatId = activeChatId;
        if (sellerNameElem) sellerNameElem.textContent = (adMeta.title ? `${adMeta.title} (Seller)` : "Seller");
        renderAdBannerWithMeta(adId, adMeta);
    }
}

async function fetchAdMetadata(targetAdId) {
    if (!targetAdId) return { title: "", price: 0, image: "", location: "" };
    try {
        const snap = await getDoc(doc(db, "ads", targetAdId));
        if (snap.exists()) {
            const data = snap.data();
            const image = (data.imageUrls && data.imageUrls.length) ? data.imageUrls[0] : "";
            const title = data.title || (data.brand ? (data.brand + " " + (data.model || "")) : "Ad Details");
            return {
                title: title,
                price: data.price || 0,
                image: image,
                location: data.location || ""
            };
        }
    } catch (e) {
        console.error("Ad meta fetch error:", e);
    }
    return { title: "Ad Inquiry", price: 0, image: "", location: "" };
}

async function renderAdBanner(targetAdId, chatData) {
    let meta = {
        title: chatData.adTitle || "",
        price: chatData.adPrice || 0,
        image: chatData.adImage || "",
        location: chatData.adLocation || ""
    };

    if (!meta.title && targetAdId) {
        meta = await fetchAdMetadata(targetAdId);
        if (meta.title && activeChatId) {
            await updateDoc(doc(db, "chats", activeChatId), {
                adTitle: meta.title,
                adPrice: meta.price,
                adImage: meta.image,
                adLocation: meta.location
            });
        }
    }
    renderAdBannerWithMeta(targetAdId, meta);
}

function renderAdBannerWithMeta(targetAdId, meta) {
    const banner = document.getElementById("adContextBanner");
    const imgElem = document.getElementById("adContextImg");
    const titleElem = document.getElementById("adContextTitle");
    const priceElem = document.getElementById("adContextPrice");
    const locElem = document.getElementById("adContextLocation");

    if (!banner) return;
    if (meta.title || targetAdId) {
        banner.style.display = "flex";
        if (imgElem) imgElem.src = meta.image || "images/sellby-logo.png";
        if (titleElem) titleElem.textContent = meta.title;
        if (priceElem) priceElem.textContent = t('price_symbol') + " " + Number(meta.price).toLocaleString("en-IN");
        if (locElem) locElem.textContent = "📍 " + meta.location;
        banner.onclick = () => { if (targetAdId) window.location.href = `ad-details.html?id=${targetAdId}`; };
    }
}
