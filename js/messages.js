/* ===================================================== */
/*                SELLBY MESSAGES.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : messages.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Real-time Listener
*/
/* ===================================================== */

import {

    auth,

    db

} from "./firebase-config.js";

import {

    collection,

    query,

    orderBy,

    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const chatMessages =

    document.getElementById("chatMessages");

let currentUser = null;

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href =

            "login.html";

        return;

    }

    currentUser = user;

    loadMessages();

});
/* ===================================================== */
/*                SELLBY MESSAGES.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : messages.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Load Messages
    ✔ Build Message Bubble
    ✔ Real-time Chat
*/
/* ===================================================== */

function loadMessages() {

    const messagesQuery = query(

        collection(db, "messages"),

        orderBy("createdAt", "asc")

    );

    onSnapshot(messagesQuery, (snapshot) => {

        chatMessages.innerHTML = "";

        snapshot.forEach((doc) => {

            const message =

                doc.data();

            const bubble =

                document.createElement("div");

            bubble.className =

                message.senderId === currentUser.uid

                ? "message sent"

                : "message received";

            bubble.innerHTML = `

                <div class="message-text">

                    ${message.message}

                </div>

                <div class="message-time">

                    ${message.createdAt?.toDate?.()
                        ?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        }) || ""}

                </div>

            `;

            chatMessages.appendChild(bubble);

        });

    });

}
/* ===================================================== */
/*                SELLBY MESSAGES.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : messages.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Auto Scroll
    ✔ Message Status
    ✔ Chat Ready
*/
/* ===================================================== */

function scrollToBottom() {

    chatMessages.scrollTop =

        chatMessages.scrollHeight;

}

const observer =

    new MutationObserver(() => {

        scrollToBottom();

    });

observer.observe(

    chatMessages,

    {

        childList: true

    }

);

document.addEventListener(

    "DOMContentLoaded",

    () => {

        scrollToBottom();

        console.log(

            "Messages Loaded Successfully"

        );

    }

);