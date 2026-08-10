/* ===================================================== */
/*                SELLBY MESSAGES.JS                     */
/* ===================================================== */

import { auth, db } from "./firebase-config.js";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

let currentUser = null;
let currentChatId = null;
let messagesUnsubscribe = null;

auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    currentUser = user;
    pollForChatId();
});

function pollForChatId() {
    const params = new URLSearchParams(window.location.search);
    const urlChatId = params.get("chatId");

    if (urlChatId) {
        currentChatId = urlChatId;
        listenToMessages(currentChatId);
        return;
    }

    // Wait for chat.js to initialize activeChatId if navigating via adId/sellerId
    const checkInterval = setInterval(() => {
        if (window.activeChatId) {
            clearInterval(checkInterval);
            currentChatId = window.activeChatId;
            listenToMessages(currentChatId);
        }
    }, 100);

    // Timeout safety after 10s
    setTimeout(() => clearInterval(checkInterval), 10000);
}

function listenToMessages(chatId) {
    if (messagesUnsubscribe) messagesUnsubscribe();

    const messagesQuery = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
    );

    messagesUnsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const container = document.getElementById("chatMessages");
        if (!container) return;
        container.innerHTML = "";

        snapshot.forEach((messageDoc) => {
            const msg = messageDoc.data();
            const isSentByMe = (msg.senderId === currentUser.uid);
            
            const bubble = document.createElement("div");
            bubble.className = isSentByMe ? "message sent" : "message received";

            const textDiv = document.createElement("div");
            textDiv.className = "message-text";
            textDiv.textContent = msg.message || "";

            const timeDiv = document.createElement("div");
            timeDiv.className = "message-time";
            if (msg.createdAt && msg.createdAt.toDate) {
                timeDiv.textContent = msg.createdAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
            } else {
                timeDiv.textContent = "";
            }

            bubble.appendChild(textDiv);
            bubble.appendChild(timeDiv);
            container.appendChild(bubble);
        });

        // Clear unread indicator since current user is actively viewing this chat
        try {
            const chatSnap = await getDoc(doc(db, "chats", chatId));
            if (chatSnap.exists() && chatSnap.data().unreadFor === currentUser.uid) {
                await updateDoc(doc(db, "chats", chatId), { unreadFor: "" });
            }
        } catch (e) {
            // Ignore background clear errors
        }

        scrollToBottom();
    }, (error) => {
        console.error("Error loading chat messages:", error);
    });
}

async function sendMessage() {
    if (!currentUser) return;

    if (!currentChatId) {
        const params = new URLSearchParams(window.location.search);
        currentChatId = params.get("chatId") || window.activeChatId;
    }

    if (!currentChatId) {
        console.warn("Chat session initializing...");
        return;
    }

    const messageInput = document.getElementById("messageInput");
    if (!messageInput) return;

    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = "";

    try {
        let recipientUid = "";
        const chatSnap = await getDoc(doc(db, "chats", currentChatId));
        if (chatSnap.exists()) {
            const chatData = chatSnap.data();
            recipientUid = (chatData.buyerId === currentUser.uid) ? chatData.sellerId : chatData.buyerId;
            if (!recipientUid && chatData.participants && chatData.participants.length) {
                recipientUid = chatData.participants.find(p => p !== currentUser.uid) || "";
            }
        }

        await addDoc(collection(db, "chats", currentChatId, "messages"), {
            senderId: currentUser.uid,
            receiverId: recipientUid,
            message: text,
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "chats", currentChatId), {
            lastMessage: text,
            lastMessageSenderId: currentUser.uid,
            unreadFor: recipientUid,
            updatedAt: serverTimestamp()
        });

        scrollToBottom();
    } catch (error) {
        console.error("Failed to send message:", error);
        alert("Could not send message. Please try again.");
    }
}

function initEventListeners() {
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");

    if (sendBtn && !sendBtn.dataset.bound) {
        sendBtn.dataset.bound = "true";
        sendBtn.addEventListener("click", sendMessage);
    }

    if (messageInput && !messageInput.dataset.bound) {
        messageInput.dataset.bound = "true";
        messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initEventListeners);
if (document.readyState === "interactive" || document.readyState === "complete") {
    initEventListeners();
}

function scrollToBottom() {
    const chatMessages = document.getElementById("chatMessages");
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

console.log("SELLBY Messages Manager Loaded");