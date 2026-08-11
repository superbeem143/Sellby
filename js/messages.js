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
    writeBatch,
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

        const unreadDocsToMark = [];

        snapshot.forEach((messageDoc) => {
            const msg = messageDoc.data();
            const isSentByMe = (msg.senderId === currentUser.uid);
            
            if (!isSentByMe && msg.isRead !== true) {
                unreadDocsToMark.push(messageDoc.ref);
            }

            const bubble = document.createElement("div");
            bubble.className = isSentByMe ? "message sent" : "message received";

            if (msg.type === "audio" || msg.audioUrl) {
                const audioDiv = document.createElement("div");
                audioDiv.className = "audio-bubble-player";
                const audioElement = document.createElement("audio");
                audioElement.controls = true;
                audioElement.src = msg.audioUrl || "";
                audioDiv.appendChild(audioElement);
                bubble.appendChild(audioDiv);
            } else {
                const textDiv = document.createElement("div");
                textDiv.className = "message-text";
                textDiv.textContent = msg.message || "";
                bubble.appendChild(textDiv);
            }

            const timeDiv = document.createElement("div");
            timeDiv.className = "message-time";
            let timeStr = "";
            if (msg.createdAt && msg.createdAt.toDate) {
                timeStr = msg.createdAt.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
            }
            timeDiv.textContent = timeStr;

            if (isSentByMe) {
                const tickSpan = document.createElement("span");
                tickSpan.className = msg.isRead ? "tick-read" : "tick-unread";
                tickSpan.style.cssText = msg.isRead
                    ? "margin-left:6px;color:#4cd964;font-weight:bold;font-size:13px;"
                    : "margin-left:6px;opacity:0.75;font-size:12px;";
                tickSpan.textContent = msg.isRead ? " ✓✓" : " ✓";
                timeDiv.appendChild(tickSpan);
            }

            bubble.appendChild(timeDiv);
            container.appendChild(bubble);
        });

        // Mark incoming messages read if chat is actively viewed in foreground
        if (document.visibilityState === "visible") {
            await markChatMessagesAsRead(chatId, unreadDocsToMark);
        }

        scrollToBottom();
    }, (error) => {
        console.error("Error loading chat messages:", error);
    });
}

async function markChatMessagesAsRead(chatId, unreadDocsToMark = []) {
    if (!currentUser || !chatId) return;

    try {
        if (unreadDocsToMark.length > 0) {
            const batch = writeBatch(db);
            unreadDocsToMark.forEach((ref) => {
                batch.update(ref, { isRead: true });
            });
            await batch.commit();
        }

        // Clear unread indicator since current user is actively viewing this chat
        const chatSnap = await getDoc(doc(db, "chats", chatId));
        if (chatSnap.exists() && chatSnap.data().unreadFor === currentUser.uid) {
            await updateDoc(doc(db, "chats", chatId), { unreadFor: "" });
        }
    } catch (e) {
        console.warn("Background read status update notice:", e);
    }
}

// Re-check read status on tab visibility change or focus
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && currentChatId) {
        markChatMessagesAsRead(currentChatId);
    }
});
window.addEventListener("focus", () => {
    if (currentChatId) {
        markChatMessagesAsRead(currentChatId);
    }
});

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
            isRead: false,
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

    initVoiceRecorder();
}

let mediaRecorder = null;
let audioChunks = [];
let recTimerInterval = null;
let secondsRecorded = 0;
let recordedAudioDataUrl = null;

function initVoiceRecorder() {
    const voiceMsgBtn = document.getElementById("voiceMsgBtn");
    const voiceRecordingBar = document.getElementById("voiceRecordingBar");
    const recTimer = document.getElementById("recTimer");
    const cancelVoiceBtn = document.getElementById("cancelVoiceBtn");
    const sendVoiceNoteBtn = document.getElementById("sendVoiceNoteBtn");

    if (!voiceMsgBtn || voiceMsgBtn.dataset.bound) return;
    voiceMsgBtn.dataset.bound = "true";

    voiceMsgBtn.addEventListener("click", async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            stopRecording();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    recordedAudioDataUrl = reader.result;
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            voiceMsgBtn.classList.add("recording");
            if (voiceRecordingBar) voiceRecordingBar.style.display = "flex";

            secondsRecorded = 0;
            if (recTimer) recTimer.textContent = "00:00";
            recTimerInterval = setInterval(() => {
                secondsRecorded++;
                const mins = String(Math.floor(secondsRecorded / 60)).padStart(2, '0');
                const secs = String(secondsRecorded % 60).padStart(2, '0');
                if (recTimer) recTimer.textContent = `${mins}:${secs}`;
            }, 1000);

        } catch (err) {
            console.error("Microphone access error:", err);
            if (voiceRecordingBar) voiceRecordingBar.style.display = "none";
            if (voiceMsgBtn) voiceMsgBtn.classList.remove("recording");

            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                alert("Microphone permission was denied. Please click the lock icon in your browser address bar to allow microphone access for SELLBY.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                alert("No microphone hardware found on your device. Please connect a microphone to record voice messages.");
            } else {
                alert("Could not access microphone: " + (err.message || "Please check browser permissions."));
            }
        }
    });

    if (cancelVoiceBtn) {
        cancelVoiceBtn.addEventListener("click", () => {
            stopRecording();
            if (voiceRecordingBar) voiceRecordingBar.style.display = "none";
            if (voiceMsgBtn) voiceMsgBtn.classList.remove("recording");
            recordedAudioDataUrl = null;
        });
    }

    if (sendVoiceNoteBtn) {
        sendVoiceNoteBtn.addEventListener("click", async () => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
            if (voiceRecordingBar) voiceRecordingBar.style.display = "none";
            if (voiceMsgBtn) voiceMsgBtn.classList.remove("recording");
            clearInterval(recTimerInterval);

            setTimeout(async () => {
                if (recordedAudioDataUrl) {
                    await sendVoiceMessage(recordedAudioDataUrl);
                    recordedAudioDataUrl = null;
                }
            }, 300);
        });
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
    clearInterval(recTimerInterval);
    const voiceMsgBtn = document.getElementById("voiceMsgBtn");
    if (voiceMsgBtn) voiceMsgBtn.classList.remove("recording");
}

async function sendVoiceMessage(audioDataUrl) {
    if (!currentUser || !audioDataUrl) return;

    if (!currentChatId) {
        const params = new URLSearchParams(window.location.search);
        currentChatId = params.get("chatId") || window.activeChatId;
    }

    if (!currentChatId) return;

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
            type: "audio",
            audioUrl: audioDataUrl,
            message: "🎵 Voice Note",
            isRead: false,
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "chats", currentChatId), {
            lastMessage: "🎵 Voice Note",
            lastMessageSenderId: currentUser.uid,
            unreadFor: recipientUid,
            updatedAt: serverTimestamp()
        });

        scrollToBottom();
    } catch (error) {
        console.error("Failed to send voice message:", error);
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