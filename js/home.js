/* ===================================================== */
/*                  SELLBY HOME.JS                       */
/* ===================================================== */

import { auth, signOut, db } from "./firebase-config.js";
import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const menuBtn = document.querySelector(".menu-btn");
const sideMenu = document.getElementById("sideMenu");
const logoutBtn = document.getElementById("logoutBtn");
const notifyBtn = document.querySelector(".notify-btn");

if (menuBtn && sideMenu) {
    menuBtn.addEventListener("click", () => {
        sideMenu.classList.toggle("show");
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
    });
}

if (notifyBtn) {
    notifyBtn.addEventListener("click", () => {
        window.location.href = "chats.html";
    });
}

auth.onAuthStateChanged((user) => {
    if (!user) return;

    try {
        const unreadQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid),
            where("unreadFor", "==", user.uid)
        );

        onSnapshot(unreadQuery, (snapshot) => {
            if (!notifyBtn) return;
            let badge = notifyBtn.querySelector(".notify-badge");
            if (!snapshot.empty) {
                if (!badge) {
                    badge = document.createElement("span");
                    badge.className = "notify-badge";
                    badge.style.cssText = "position:absolute;top:4px;right:4px;width:10px;height:10px;background:#ff4d4d;border-radius:50%;border:2px solid #0057D9;";
                    notifyBtn.style.position = "relative";
                    notifyBtn.appendChild(badge);
                }
                badge.style.display = "block";
            } else {
                if (badge) badge.style.display = "none";
            }
        }, (error) => {
            console.warn("Unread badge query notice:", error);
        });
    } catch (err) {
        console.warn("Unread notification initialization notice:", err);
    }
});

console.log("SELLBY Home Script Ready");
