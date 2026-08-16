/* =====================================================
   SELLBY — CHAT
   Firebase Firestore Chat
===================================================== */

import {
    auth,
    db,
    onAuthStateChanged
} from "./firebase-config.js";

import {
    t,
    getTranslations,
    initTranslations
} from "./i18n.js";

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


/* =====================================================
   URL PARAMETERS
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

let activeChatId =
    params.get("chatId");

let adId =
    params.get("adId");

const sellerId =
    params.get("sellerId");


/* =====================================================
   ELEMENTS
===================================================== */

const sellerNameElem =
    document.getElementById("sellerName");

const sellerStatusElem =
    document.getElementById("sellerStatus");


/* =====================================================
   STATE
===================================================== */

let currentUser = null;


/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentUser = user;


        try {
            initTranslations();
        } catch (error) {
            console.warn(
                "Translation initialization:",
                error
            );
        }


        const translations =
            getTranslations();


        if (sellerStatusElem) {

            sellerStatusElem.textContent =
                translations.online ||
                "Online";

        }


        await initializeChat();

    }
);


/* =====================================================
   INITIALIZE CHAT
===================================================== */

async function initializeChat() {

    /* =========================================
       EXISTING CHAT
    ========================================= */

    if (activeChatId) {

        window.activeChatId =
            activeChatId;


        try {

            const chatSnapshot =
                await getDoc(
                    doc(
                        db,
                        "chats",
                        activeChatId
                    )
                );


            if (
                !chatSnapshot.exists()
            ) {

                console.warn(
                    "Chat document not found"
                );

                return;

            }


            const chatData =
                chatSnapshot.data();


            if (
                !adId &&
                chatData.adId
            ) {

                adId =
                    chatData.adId;

            }


            const otherRole =
                chatData.buyerId ===
                currentUser.uid
                    ? "Seller"
                    : "Buyer";


            if (sellerNameElem) {

                sellerNameElem.textContent =
                    chatData.adTitle
                        ? `${chatData.adTitle} (${otherRole})`
                        : otherRole;

            }


            /* Mark unread as read */

            if (
