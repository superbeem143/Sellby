/* ===================================================== */
/*                   SELLBY CHAT.JS                      */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : chat.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firestore Imports
    ✔ DOM Elements
    ✔ Authentication
*/
/* ===================================================== */

import {

    auth,

    db

} from "./firebase-config.js";

import {

    collection,

    addDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const chatMessages =

    document.getElementById("chatMessages");

const messageInput =

    document.getElementById("messageInput");

const sendBtn =

    document.getElementById("sendBtn");

const sellerName =

    document.getElementById("sellerName");

const sellerStatus =

    document.getElementById("sellerStatus");

let currentUser = null;

auth.onAuthStateChanged((user) => {

    if (!user) {

        window.location.href =

            "login.html";

        return;

    }

    currentUser = user;

});
/* ===================================================== */
/*                   SELLBY CHAT.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : chat.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Send Message
    ✔ Save to Firestore
    ✔ Clear Input
*/
/* ===================================================== */

sendBtn.addEventListener("click", async () => {

    const message =

        messageInput.value.trim();

    if (!message || !currentUser) {

        return;

    }

    try {

        await addDoc(

            collection(db, "messages"),

            {

                senderId:

                    currentUser.uid,

                senderEmail:

                    currentUser.email,

                receiverId:

                    "seller",

                message,

                type:

                    "text",

                createdAt:

                    serverTimestamp(),

                status:

                    "sent"

            }

        );

        messageInput.value = "";

    }

    catch (error) {

        console.error(error);

        alert(

            "Failed to send message."

        );

    }

});
/* ===================================================== */
/*                   SELLBY CHAT.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : chat.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Enter Key Support
    ✔ Auto Scroll
    ✔ Chat Ready
*/
/* ===================================================== */

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        sendBtn.click();

    }

});

function scrollToBottom() {

    chatMessages.scrollTop =

        chatMessages.scrollHeight;

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        scrollToBottom();

        console.log(

            "SELLBY Chat Ready"

        );

    }

);

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