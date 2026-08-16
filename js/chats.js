/* =====================================================
   SELLBY — MY CHATS
   Firebase / Firestore
   UI + existing chat structure preserved
===================================================== */

import {
    auth,
    db,
    onAuthStateChanged
} from "./firebase-config.js";

import {
    t,
    initTranslations
} from "./i18n.js";

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
let unsubscribeChats = null;


/* =====================================================
   AUTH
===================================================== */

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    try {
        initTranslations();
    } catch (error) {
        console.warn("Translation initialization:", error);
    }

    loadUserChats();
});


/* =====================================================
   LOAD USER CHATS
===================================================== */

function loadUserChats() {

    if (!currentUser) return;

    if (unsubscribeChats) {
        unsubscribeChats();
        unsubscribeChats = null;
    }

    if (loadingMessage) {
        loadingMessage.style.display = "block";
        loadingMessage.style.color = "#64748b";
        loadingMessage.textContent =
            t("loading") || "Loading...";
    }

    try {

        const chatsRef = collection(db, "chats");

        const chatsQuery = query(
            chatsRef,
            where(
                "participants",
                "array-contains",
                currentUser.uid
            )
        );


        unsubscribeChats = onSnapshot(

            chatsQuery,

            async (snapshot) => {

                if (loadingMessage) {
                    loadingMessage.style.display = "none";
                }


                /* =========================================
                   NO CHATS
                ========================================= */

                if (snapshot.empty) {

                    allChats = [];

                    if (chatList) {
                        chatList.innerHTML = "";
                    }

                    if (emptyState) {

                        const title =
                            emptyState.querySelector("h2");

                        if (title) {
                            title.textContent =
                                t("no_ads_yet") ||
                                "No Chats Yet";
                        }

                        emptyState.style.display = "block";
                    }

                    return;
                }


                if (emptyState) {
                    emptyState.style.display = "none";
                }


                /* =========================================
                   BUILD CHAT ARRAY
                ========================================= */

                const chats = [];

                snapshot.forEach((chatDoc) => {

                    chats.push({
                        id: chatDoc.id,
                        ...chatDoc.data()
                    });

                });


                /* =========================================
                   SORT — NEWEST FIRST
                ========================================= */

                chats.sort((a, b) => {

                    const timeA =
                        getTimestamp(a.updatedAt) ||
                        getTimestamp(a.createdAt) ||
                        0;

                    const timeB =
                        getTimestamp(b.updatedAt) ||
                        getTimestamp(b.createdAt) ||
                        0;

                    return timeB - timeA;

                });


                allChats = chats;

                renderChats(allChats);


                /* =========================================
                   ADD MISSING AD INFORMATION
                ========================================= */

                for (const chat of chats) {

                    if (
                        chat.adId &&
                        (
                            !chat.adTitle ||
                            chat.adTitle === "Ad Inquiry"
                        )
                    ) {

                        await enrichChatWithAdMetadata(chat);

                    }

                }

            },


            /* =========================================
               FIRESTORE ERROR
            ========================================= */

            (error) => {

                console.error(
                    "SELLBY chats Firestore error:",
                    error
                );

                if (loadingMessage) {

                    loadingMessage.style.display = "block";

                    loadingMessage.textContent =
                        "Unable to load chats. Please refresh.";

                    loadingMessage.style.color =
                        "#dc2626";

                }

            }

        );

    } catch (error) {

        console.error(
            "SELLBY chats initialization error:",
            error
        );

        if (loadingMessage) {

            loadingMessage.style.display = "block";

            loadingMessage.textContent =
                "Unable to load chats.";

            loadingMessage.style.color =
                "#dc2626";

        }

    }

}


/* =====================================================
   TIMESTAMP HELPER
===================================================== */

function getTimestamp(value) {

    if (!value) return 0;

    if (
        typeof value.toMillis === "function"
    ) {
        return value.toMillis();
    }

    if (value.seconds) {
        return value.seconds * 1000;
    }

    return 0;
}


/* =====================================================
   GET AD METADATA
===================================================== */

async function enrichChatWithAdMetadata(chat) {

    try {

        const adRef =
            doc(db, "ads", chat.adId);

        const adSnapshot =
            await getDoc(adRef);


        if (!adSnapshot.exists()) {
            return;
        }


        const data =
            adSnapshot.data();


        const image =
            Array.isArray(data.imageUrls) &&
            data.imageUrls.length
                ? data.imageUrls[0]
                : "";


        const title =
            data.title ||
            (
                data.brand
                    ? `${data.brand} ${data.model || ""}`.trim()
                    : "Ad Details"
            );


        const metadata = {

            adTitle: title,

            adPrice:
                data.price || 0,

            adImage:
                image,

            adLocation:
                data.location || ""

        };


        await updateDoc(
            doc(db, "chats", chat.id),
            metadata
        );


    } catch (error) {

        console.warn(
            "Could not enrich chat:",
            chat.id,
            error
        );

    }

}


/* =====================================================
   RENDER CHATS
===================================================== */

function renderChats(chats) {

    if (!chatList) return;

    chatList.innerHTML = "";


    if (!chats.length) {

        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;
    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    chats.forEach((chat) => {

        const isUnread =
            chat.unreadFor === currentUser.uid;


        const otherRole =
            chat.buyerId === currentUser.uid
                ? "Seller"
                : "Buyer";


        const title =
            chat.adTitle ||
            "Ad Inquiry";


        const image =
            chat.adImage ||
            "images/sellby-logo.png";


        const price =
            chat.adPrice
                ? `₹${Number(
                    chat.adPrice
                ).toLocaleString("en-IN")}`
                : "";


        const location =
            chat.adLocation || "";


        const message =
            chat.lastMessage ||
            "No messages yet";


        const card =
            document.createElement("div");


        card.className =
            isUnread
                ? "chat-item unread"
                : "chat-item";


        card.innerHTML = `

            <div
                class="avatar"
                style="
                    width:55px;
                    height:55px;
                    border-radius:12px;
                    overflow:hidden;
                    background:#f1f5f9;
                    flex-shrink:0;
                    border:1px solid #e2e8f0;
                "
            >

                <img
                    src="${escapeHtml(image)}"
                    alt="Ad"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                    "
                >

            </div>


            <div
                class="chat-info"
                style="
                    flex:1;
                    margin-left:12px;
                    min-width:0;
                "
            >

                <div
                    class="chat-name"
                    style="
                        font-size:15px;
                        font-weight:700;
                        color:#1e293b;
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    "
                >
                    ${escapeHtml(title)}
                </div>


                <div
                    style="
                        font-size:12px;
                        color:#64748b;
                        margin:3px 0;
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    "
                >

                    <span
                        style="
                            font-weight:700;
                            color:#6d28d9;
                        "
                    >
                        ${escapeHtml(price)}
                    </span>

                    ${price ? " • " : ""}

                    <span>
                        ${escapeHtml(otherRole)}
                    </span>

                    ${
                        location
                            ? ` • 📍 ${escapeHtml(location)}`
                            : ""
                    }

                </div>


                <div
                    class="last-message"
                    style="
                        font-size:13px;
                        color:${
                            isUnread
                                ? "#111827"
                                : "#64748b"
                        };
                        font-weight:${
                            isUnread
                                ? "700"
                                : "400"
                        };
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    "
                >
                    ${escapeHtml(message)}
                </div>

            </div>


            ${
                isUnread
                    ? `
                        <div
                            class="unread-dot"
                            style="
                                width:10px;
                                height:10px;
                                background:#db2777;
                                border-radius:50%;
                                flex-shrink:0;
                            "
                        ></div>
                    `
                    : ""
            }

        `;


        /* =========================================
           OPEN CHAT
        ========================================= */

        card.addEventListener(
            "click",
            () => {

                const url =
                    "chat.html" +
                    "?chatId=" +
                    encodeURIComponent(chat.id) +
                    "&adId=" +
                    encodeURIComponent(
                        chat.adId || ""
                    ) +
                    "&sellerId=" +
                    encodeURIComponent(
                        chat.sellerId || ""
                    );

                window.location.href = url;

            }
        );


        chatList.appendChild(card);

    });

}


/* =====================================================
   SEARCH
===================================================== */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        (event) => {

            const value =
                event.target.value
                    .toLowerCase()
                    .trim();


            if (!value) {

                renderChats(allChats);

                return;
            }


            const filtered =
                allChats.filter((chat) => {

                    const title =
                        String(
                            chat.adTitle || ""
                        ).toLowerCase();

                    const message =
                        String(
                            chat.lastMessage || ""
                        ).toLowerCase();

                    const location =
                        String(
                            chat.adLocation || ""
                        ).toLowerCase();


                    return (
                        title.includes(value) ||
                        message.includes(value) ||
                        location.includes(value)
                    );

                });


            renderChats(filtered);

        }
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;

}


console.log(
    "SELLBY My Chats — Firebase version loaded"
);
