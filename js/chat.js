/* ===================================================== */
/*                  SELLBY CHAT.JS                       */
/*             FINAL BUYER ↔ SELLER CHAT                 */
/* ===================================================== */

import {
    auth,
    db
} from "./firebase-config.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const chatList = document.getElementById("chatList");
const loadingMessage = document.getElementById("loadingMessage");
const emptyState = document.getElementById("emptyState");

const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;
let currentChatId = null;
let unsubscribeMessages = null;


/* ===================================================== */
/*                 AUTHENTICATION                         */
/* ===================================================== */

auth.onAuthStateChanged(async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    currentUser = user;

    /*
        If chatMessages exists, this is chat.html.
        Otherwise it is chats.html.
    */

    if (chatMessages) {

        await initializeChatPage();

    }

    else if (chatList) {

        loadChats();

    }

});


/* ===================================================== */
/*                 CHAT PAGE                              */
/* ===================================================== */

async function initializeChatPage() {

    const params = new URLSearchParams(
        window.location.search
    );

    const adId = params.get("adId");
    const sellerId = params.get("sellerId");
    const buyerId =
        params.get("buyerId") || currentUser.uid;

    if (!adId) {

        console.error(
            "SELLBY Chat Error: adId missing."
        );

        return;
    }

    /*
        For a buyer:
        sellerId comes from the property/ad.

        For a seller:
        sellerId is the current user.
    */

    const finalSellerId =
        sellerId || currentUser.uid;

    const finalBuyerId =
        buyerId || currentUser.uid;

    /*
        Create one deterministic chat ID.

        Same:
        ad + buyer + seller

        = same conversation
    */

    currentChatId = createChatId(
        adId,
        finalBuyerId,
        finalSellerId
    );

    await ensureChatExists(
        currentChatId,
        adId,
        finalBuyerId,
        finalSellerId
    );

    /*
        Start realtime messages.
    */

    startMessageListener(
        currentChatId
    );

    /*
        Activate Send button.
    */

    if (sendBtn) {

        sendBtn.addEventListener(
            "click",
            sendMessage
        );

    }

    /*
        Allow Enter key to send.
    */

    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }

    console.log(
        "SELLBY Chat Ready:",
        currentChatId
    );

}


/* ===================================================== */
/*                 CREATE CHAT ID                         */
/* ===================================================== */

function createChatId(
    adId,
    buyerId,
    sellerId
) {

    return `${adId}_${buyerId}_${sellerId}`;

}


/* ===================================================== */
/*                 CREATE / GET CHAT                      */
/* ===================================================== */

async function ensureChatExists(
    chatId,
    adId,
    buyerId,
    sellerId
) {

    const chatRef = doc(
        db,
        "chats",
        chatId
    );

    const chatSnap = await getDoc(
        chatRef
    );

    if (!chatSnap.exists()) {

        await setDoc(
            chatRef,
            {

                adId: adId,

                buyerId: buyerId,

                sellerId: sellerId,

                lastMessage: "",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );

        console.log(
            "New SELLBY chat created:",
            chatId
        );

    }

}


/* ===================================================== */
/*                 SEND MESSAGE                          */
/* ===================================================== */

async function sendMessage() {

    if (!currentUser) {

        return;
    }

    if (!currentChatId) {

        console.error(
            "Chat ID is missing."
        );

        return;
    }

    if (!messageInput) {

        return;
    }

    const text =
        messageInput.value.trim();

    if (!text) {

        return;
    }

    /*
        Prevent double sending.
    */

    sendBtn.disabled = true;

    try {

        const messagesRef =
            collection(
                db,
                "chats",
                currentChatId,
                "messages"
            );

        /*
            Save message inside
            this specific chat.
        */

        await addDoc(
            messagesRef,
            {

                senderId:
                    currentUser.uid,

                message:
                    text,

                createdAt:
                    serverTimestamp(),

                read: false

            }
        );

        /*
            Update chat preview.
        */

        await updateDoc(
            doc(
                db,
                "chats",
                currentChatId
            ),
            {

                lastMessage:
                    text,

                updatedAt:
                    serverTimestamp()

            }
        );

        messageInput.value = "";

        messageInput.focus();

    }

    catch (error) {

        console.error(
            "SELLBY Send Message Error:",
            error
        );

        alert(
            "Message could not be sent. Please try again."
        );

    }

    finally {

        sendBtn.disabled = false;

    }

}


/* ===================================================== */
/*                 REALTIME MESSAGES                     */
/* ===================================================== */

function startMessageListener(
    chatId
) {

    const messagesRef =
        collection(
            db,
            "chats",
            chatId,
            "messages"
        );

    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );

    /*
        Remove old listener if one exists.
    */

    if (unsubscribeMessages) {

        unsubscribeMessages();

    }

    unsubscribeMessages =
        onSnapshot(
            messagesQuery,
            (snapshot) => {

                if (!chatMessages) {

                    return;
                }

                chatMessages.innerHTML =
                    "";

                snapshot.forEach(
                    (messageDoc) => {

                        const message =
                            messageDoc.data();

                        renderMessage(
                            message
                        );

                    }
                );

                scrollToBottom();

            },
            (error) => {

                console.error(
                    "SELLBY Message Listener Error:",
                    error
                );

            }
        );

}


/* ===================================================== */
/*                 RENDER MESSAGE                        */
/* ===================================================== */

function renderMessage(
    message
) {

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        message.senderId ===
        currentUser.uid

        ? "message sent"

        : "message received";

    const text =
        document.createElement(
            "div"
        );

    text.className =
        "message-text";

    /*
        textContent is used instead
        of innerHTML for safety.
    */

    text.textContent =
        message.message || "";

    bubble.appendChild(
        text
    );

    if (
        message.createdAt &&
        typeof message.createdAt.toDate ===
        "function"
    ) {

        const time =
            document.createElement(
                "div"
            );

        time.className =
            "message-time";

        time.textContent =
            message.createdAt
                .toDate()
                .toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );

        bubble.appendChild(
            time
        );

    }

    chatMessages.appendChild(
        bubble
    );

}


/* ===================================================== */
/*                 AUTO SCROLL                           */
/* ===================================================== */

function scrollToBottom() {

    if (!chatMessages) {

        return;
    }

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* ===================================================== */
/*                 LOAD SELLER CHATS                     */
/* ===================================================== */

function loadChats() {

    if (!currentUser) {

        return;
    }

    const chatsQuery =
        query(

            collection(
                db,
                "chats"
            ),

            where(
                "sellerId",
                "==",
                currentUser.uid
            ),

            orderBy(
                "updatedAt",
                "desc"
            )

        );

    onSnapshot(
        chatsQuery,
        (snapshot) => {

            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }

            if (chatList) {

                chatList.innerHTML =
                    "";

            }

            if (
                snapshot.empty
            ) {

                if (emptyState) {

                    emptyState.style.display =
                        "block";

                }

                return;
            }

            if (emptyState) {

                emptyState.style.display =
                    "none";

            }

            snapshot.forEach(
                (chatDoc) => {

                    const chat =
                        chatDoc.data();

                    const chatCard =
                        document.createElement(
                            "div"
                        );

                    chatCard.className =
                        "chat-item";

                    chatCard.innerHTML = `

                        <div class="avatar">
                            👤
                        </div>

                        <div class="chat-info">

                            <div class="chat-name">
                                Buyer
                            </div>

                            <div class="last-message">
                                ${
                                    chat.lastMessage ||
                                    "Start Conversation"
                                }
                            </div>

                        </div>

                        <div class="chat-time">
                            Chat
                        </div>

                    `;

                    chatCard.addEventListener(
                        "click",
                        () => {

                            const url =
                                `chat.html?adId=${encodeURIComponent(
                                    chat.adId
                                )}&sellerId=${encodeURIComponent(
                                    chat.sellerId
                                )}&buyerId=${encodeURIComponent(
                                    chat.buyerId
                                )}`;

                            window.location.href =
                                url;

                        }
                    );

                    chatList.appendChild(
                        chatCard
                    );

                }
            );

        },
        (error) => {

            console.error(
                "SELLBY Chats Error:",
                error
            );

            if (loadingMessage) {

                loadingMessage.style.display =
                    "none";

            }

            if (emptyState) {

                emptyState.style.display =
                    "block";

                emptyState.innerHTML = `
                    <h3>Failed to load chats.</h3>
                `;

            }

        }
    );

}


console.log(
    "SELLBY Chat System Ready"
);
