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
                chatData.unreadFor ===
                currentUser.uid
            ) {

                await updateDoc(
                    doc(
                        db,
                        "chats",
                        activeChatId
                    ),
                    {
                        unreadFor: ""
                    }
                );

            }


            await renderAdBanner(
                adId,
                chatData
            );

        } catch (error) {

            console.error(
                "Error opening chat:",
                error
            );

        }


        return;

    }


    /* =========================================
       NEW / EXISTING AD CHAT
    ========================================= */

    if (
        adId &&
        sellerId
    ) {

        const adMeta =
            await fetchAdMetadata(
                adId
            );


        /* =====================================
           SELLER OPENING OWN CHAT
        ===================================== */

        if (
            currentUser.uid ===
            sellerId
        ) {

            const sellerQuery =
                query(
                    collection(
                        db,
                        "chats"
                    ),

                    where(
                        "adId",
                        "==",
                        adId
                    ),

                    where(
                        "sellerId",
                        "==",
                        sellerId
                    )
                );


            const snapshot =
                await getDocs(
                    sellerQuery
                );


            if (
                !snapshot.empty
            ) {

                const chatDoc =
                    snapshot.docs[0];


                activeChatId =
                    chatDoc.id;


                window.activeChatId =
                    activeChatId;


                if (sellerNameElem) {

                    sellerNameElem.textContent =
                        adMeta.title
                            ? `${adMeta.title} (Buyer)`
                            : "Buyer";

                }


                if (
                    chatDoc.data()
                        .unreadFor ===
                    currentUser.uid
                ) {

                    await updateDoc(
                        doc(
                            db,
                            "chats",
                            activeChatId
                        ),
                        {
                            unreadFor: ""
                        }
                    );

                }


                renderAdBannerWithMeta(
                    adId,
                    adMeta
                );

            } else {

                alert(
                    "Own ad chat only via My Chats."
                );

                window.history.back();

            }


            return;

        }


        /* =====================================
           BUYER — FIND EXISTING CHAT
        ===================================== */

        const existingQuery =
            query(
                collection(
                    db,
                    "chats"
                ),

                where(
                    "adId",
                    "==",
                    adId
                ),

                where(
                    "buyerId",
                    "==",
                    currentUser.uid
                ),

                where(
                    "sellerId",
                    "==",
                    sellerId
                )
            );


        const snapshot =
            await getDocs(
                existingQuery
            );


        /* =====================================
           EXISTING
        ===================================== */

        if (
            !snapshot.empty
        ) {

            const chatDoc =
                snapshot.docs[0];


            activeChatId =
                chatDoc.id;


            const existingData =
                chatDoc.data();


            if (
                existingData.unreadFor ===
                currentUser.uid
            ) {

                await updateDoc(
                    doc(
                        db,
                        "chats",
                        activeChatId
                    ),
                    {
                        unreadFor: ""
                    }
                );

            }


            if (
                !existingData.adTitle &&
                adMeta.title
            ) {

                await updateDoc(
                    doc(
                        db,
                        "chats",
                        activeChatId
                    ),
                    {
                        adTitle:
                            adMeta.title,

                        adPrice:
                            adMeta.price,

                        adImage:
                            adMeta.image,

                        adLocation:
                            adMeta.location
                    }
                );

            }

        }


        /* =====================================
           CREATE NEW CHAT
        ===================================== */

        else {

            const newChatRef =
                await addDoc(
                    collection(
                        db,
                        "chats"
                    ),
                    {

                        adId:

                            adId,

                        sellerId:

                            sellerId,

                        buyerId:

                            currentUser.uid,

                        participants: [

                            currentUser.uid,

                            sellerId

                        ],

                        adTitle:

                            adMeta.title ||
                            "Ad Inquiry",

                        adPrice:

                            adMeta.price ||
                            0,

                        adImage:

                            adMeta.image ||
                            "",

                        adLocation:

                            adMeta.location ||
                            "",

                        lastMessage:

                            "",

                        lastMessageSenderId:

                            "",

                        unreadFor:

                            "",

                        createdAt:

                            serverTimestamp(),

                        updatedAt:

                            serverTimestamp()

                    }
                );


            activeChatId =
                newChatRef.id;

        }


        window.activeChatId =
            activeChatId;


        if (sellerNameElem) {

            sellerNameElem.textContent =
                adMeta.title
                    ? `${adMeta.title} (Seller)`
                    : "Seller";

        }


        renderAdBannerWithMeta(
            adId,
            adMeta
        );

    }

}


/* =====================================================
   FETCH AD
===================================================== */

async function fetchAdMetadata(
    targetAdId
) {

    if (!targetAdId) {

        return {
            title: "",
            price: 0,
            image: "",
            location: ""
        };

    }


    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "ads",
                    targetAdId
                )
            );


        if (
            snapshot.exists()
        ) {

            const data =
                snapshot.data();


            const image =
                Array.isArray(
                    data.imageUrls
                ) &&
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


            return {

                title:

                    title,

                price:

                    data.price || 0,

                image:

                    image,

                location:

                    data.location || ""

            };

        }

    } catch (error) {

        console.error(
            "Ad metadata error:",
            error
        );

    }


    return {

        title:
            "Ad Inquiry",

        price:
            0,

        image:
            "",

        location:
            ""

    };

}


/* =====================================================
   AD BANNER
===================================================== */

async function renderAdBanner(
    targetAdId,
    chatData
) {

    let meta = {

        title:
            chatData.adTitle || "",

        price:
            chatData.adPrice || 0,

        image:
            chatData.adImage || "",

        location:
            chatData.adLocation || ""

    };


    if (
        !meta.title &&
        targetAdId
    ) {

        meta =
            await fetchAdMetadata(
                targetAdId
            );


        if (
            meta.title &&
            activeChatId
        ) {

            await updateDoc(
                doc(
                    db,
                    "chats",
                    activeChatId
                ),
                {

                    adTitle:
                        meta.title,

                    adPrice:
                        meta.price,

                    adImage:
                        meta.image,

                    adLocation:
                        meta.location

                }
            );

        }

    }


    renderAdBannerWithMeta(
        targetAdId,
        meta
    );

}


/* =====================================================
   RENDER AD BANNER UI
===================================================== */

function renderAdBannerWithMeta(
    targetAdId,
    meta
) {

    const banner =
        document.getElementById(
            "adContextBanner"
        );

    const image =
        document.getElementById(
            "adContextImg"
        );

    const title =
        document.getElementById(
            "adContextTitle"
        );

    const price =
        document.getElementById(
            "adContextPrice"
        );

    const location =
        document.getElementById(
            "adContextLocation"
        );


    if (!banner) return;


    if (
        meta.title ||
        targetAdId
    ) {

        banner.style.display =
            "flex";


        if (image) {

            image.src =
                meta.image ||
                "images/sellby-logo.png";

        }


        if (title) {

            title.textContent =
                meta.title ||
                "Ad Details";

        }


        if (price) {

            price.textContent =
                "₹ " +
                Number(
                    meta.price || 0
                ).toLocaleString(
                    "en-IN"
                );

        }


        if (location) {

            location.textContent =
                meta.location
                    ? "📍 " +
                      meta.location
                    : "";

        }


        banner.onclick = () => {

            if (!targetAdId) return;

            window.location.href =
                `ad-details.html?id=${encodeURIComponent(targetAdId)}`;

        };

    }

}


console.log(
    "SELLBY Chat — Firebase version loaded"
);
