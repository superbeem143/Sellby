/* ===================================================== */
/*                  SELLBY CHAT.JS                       */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
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
                if (sellerStatusElem) {
                    sellerStatusElem.textContent = "🟢 Online";
                }
                if (chatData.unreadFor === currentUser.uid) {
                    await updateDoc(doc(db, "chats", activeChatId), { unreadFor: "" });
                }

                // Render Ad Context Banner
                await renderAdBanner(adId, chatData);
            }
        } catch (err) {
            console.error("Error initializing chat by ID:", err);
        }
        return;
    }

    if (adId && sellerId) {
        // Fetch ad details to ensure ad metadata is saved on chat document
        const adMeta = await fetchAdMetadata(adId);

        if (currentUser.uid === sellerId) {
            // Seller opening chat for own ad
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
                if (sellerStatusElem) sellerStatusElem.textContent = "🟢 Online";
                if (chatDoc.data().unreadFor === currentUser.uid) {
                    await updateDoc(doc(db, "chats", activeChatId), { unreadFor: "" });
                }
                renderAdBannerWithMeta(adId, adMeta);
            } else {
                alert("You are the seller of this listing.");
                window.history.back();
                return;
            }
            return;
        }

        // Current user is Buyer, query existing conversation with seller for this exact ad
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
            // Update metadata on existing chat if missing
            if (!existingData.adTitle && adMeta.title) {
                await updateDoc(doc(db, "chats", activeChatId), {
                    adTitle: adMeta.title,
                    adPrice: adMeta.price,
                    adImage: adMeta.image,
                    adLocation: adMeta.location
                });
            }
        } else {
            // Create new chat document linked permanently to adId
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
        if (sellerStatusElem) sellerStatusElem.textContent = "🟢 Online";
        renderAdBannerWithMeta(adId, adMeta);
    }
}

async function fetchAdMetadata(targetAdId) {
    if (!targetAdId) return { title: "", price: 0, image: "", location: "" };

    const collectionsToTry = ["ads", "properties", "property", "cars", "bikes", "mobiles", "electronics", "furniture", "others"];
    for (const colName of collectionsToTry) {
        try {
            const snap = await getDoc(doc(db, colName, targetAdId));
            if (snap.exists()) {
                const data = snap.data();
                const image = (data.imageUrls && data.imageUrls.length)
                    ? data.imageUrls[0]
                    : (data.imageUrl || data.image || data.photo || "");
                return {
                    title: data.title || "Untitled Listing",
                    price: data.price || 0,
                    image: image,
                    location: data.location || ""
                };
            }
        } catch (e) {
            // Continue trying other collections
        }
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

        if (imgElem) {
            imgElem.src = meta.image || "https://via.placeholder.com/100x100?text=No+Image";
        }
        if (titleElem) {
            titleElem.textContent = meta.title || "Ad Listing";
        }
        if (priceElem) {
            priceElem.textContent = meta.price ? ("₹ " + Number(meta.price).toLocaleString("en-IN")) : "";
        }
        if (locElem) {
            locElem.textContent = meta.location ? ("📍 " + meta.location) : "";
        }

        banner.onclick = () => {
            if (targetAdId) {
                window.location.href = `ad-details.html?id=${targetAdId}`;
            }
        };
    }
}

console.log("SELLBY Chat Session Initializer Ready");