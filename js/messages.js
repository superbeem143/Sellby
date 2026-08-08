import { db } from "./firebase-config.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

export function subscribeMessages(chatId, callback) {

    const messagesRef = collection(
        db,
        "chats",
        chatId,
        "messages"
    );

    const messagesQuery = query(
        messagesRef,
        orderBy("createdAt", "asc")
    );

    return onSnapshot(messagesQuery, (snapshot) => {

        const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        callback(messages);

    }, (error) => {

        console.error(
            "Messages listener error:",
            error
        );

    });

                      }
