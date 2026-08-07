/* ===================================================== */
/*                  SELLBY CHATS.JS                      */
/*                     JS PART 1                         */
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
    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const chatList =
document.getElementById("chatList");

const loadingMessage =
document.getElementById("loadingMessage");

const emptyState =
document.getElementById("emptyState");

let currentUser = null;

auth.onAuthStateChanged((user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser = user;

    loadChats();

});

function loadChats(){

    const chatsQuery = query(

        collection(db,"chats"),

        where("sellerId","==",currentUser.uid),

        orderBy("createdAt","desc")

    );

    onSnapshot(

        chatsQuery,

        (snapshot)=>{

            loadingMessage.style.display="none";

            chatList.innerHTML="";

            if(snapshot.empty){

                emptyState.style.display="block";

                return;

            }

            emptyState.style.display="none";
/* ===================================================== */
/*                  SELLBY CHATS.JS                      */
/*                     JS PART 2                         */
/* ===================================================== */

            snapshot.forEach((chatDoc)=>{

                const chat = chatDoc.data();

                const chatCard =
                document.createElement("div");

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

                            ${chat.lastMessage || "Start Conversation"}

                        </div>

                    </div>

                    <div class="chat-time">

                        Chat

                    </div>

                `;

                chatCard.addEventListener(

                    "click",

                    ()=>{

                        window.location.href =

                        `chat.html?adId=${chat.adId}&sellerId=${currentUser.uid}`;

                    }

                );

                chatList.appendChild(chatCard);

            });
/* ===================================================== */
/*                  SELLBY CHATS.JS                      */
/*                     JS PART 3                         */
/* ===================================================== */

        },

        (error)=>{

            console.error(error);

            loadingMessage.style.display="none";

            emptyState.style.display="block";

            emptyState.innerHTML = `

                <h3>Failed to load chats.</h3>

            `;

        }

    );

}

console.log(

    "SELLBY Chats Ready"

);                        