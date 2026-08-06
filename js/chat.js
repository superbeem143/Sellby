/* ===================================================== */
/*                   SELLBY CHAT.JS                      */
/*                     JS PART 1                         */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const adId = params.get("adId");

const sellerId = params.get("sellerId");

const chatMessages =
    document.getElementById("chatMessages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const sellerName =
    document.getElementById("sellerName");

let currentUser = null;

let chatId = null;

auth.onAuthStateChanged(async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await initializeChat();

});

async function initializeChat() {

    if (!adId || !sellerId) {

        alert("Invalid chat.");

        return;

    }

    const chatsRef = collection(db, "chats");

    const q = query(

        chatsRef,

        where("buyerId", "==", currentUser.uid),

        where("sellerId", "==", sellerId),

        where("adId", "==", adId)

    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

        chatId = snapshot.docs[0].id;

    } else {

        const newChat = await addDoc(

            chatsRef,

            {

                buyerId: currentUser.uid,

                sellerId,

                adId,

                createdAt: serverTimestamp(),

                lastMessage: ""

            }

        );

        chatId = newChat.id;

    }

}
/* ===================================================== */
/*                   SELLBY CHAT.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text || !chatId) {

        return;

    }

    try {

        await addDoc(

            collection(db, "messages"),

            {

                chatId,

                adId,

                senderId: currentUser.uid,

                receiverId: sellerId,

                text,

                createdAt: serverTimestamp()

            }

        );

        messageInput.value = "";

    }

    catch (error) {

        console.error(error);

        alert("Failed to send message.");

    }

}

sendBtn.addEventListener(

    "click",

    sendMessage

);

const messagesQuery = query(

    collection(db, "messages"),

    where("chatId", "==", chatId),

    orderBy("createdAt", "asc")

);

onSnapshot(

    messagesQuery,

    (snapshot) => {

        chatMessages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            const bubble =
                document.createElement("div");

            bubble.className =

                data.senderId === currentUser.uid

                ? "message sent"

                : "message received";

            bubble.textContent =
                data.text;

            chatMessages.appendChild(bubble);

        });

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }

);
/* ===================================================== */
/*                   SELLBY CHAT.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        sendMessage();

    }

});

async function loadSeller() {

    try {

        const sellerRef =
            doc(db, "users", sellerId);

        const sellerSnap =
            await getDoc(sellerRef);

        if (sellerSnap.exists()) {

            const seller =
                sellerSnap.data();

            sellerName.textContent =
                seller.name ||
                seller.displayName ||
                "Seller";

        } else {

            sellerName.textContent =
                "Seller";

        }

    }

    catch (error) {

        console.error(error);

        sellerName.textContent =
            "Seller";

    }

}

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        if (!adId || !sellerId) {

            alert("Invalid chat.");

            return;

        }

        await loadSeller();

        console.log(
            "SELLBY Chat Ready"
        );

    }

);