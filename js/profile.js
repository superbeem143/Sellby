import {
    auth,
    signOut,
    db,
    doc,
    getDoc
} from "./firebase-config.js";
import { getTranslations, t, initTranslations } from "./i18n.js";

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const profileAvatar = document.querySelector(".profile-avatar");

async function loadUserData(user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    initTranslations();

    // Default values from Auth
    userName.textContent = user.displayName || "SELLBY User";
    userEmail.textContent = user.phoneNumber || user.email || "Member";

    const cameraBadgeHTML = `<div style="position: absolute; bottom: 0; right: 0; background: #ffffff; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 1px solid #f1f5f9;"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7c3aed" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg></div>`;

    if (user.photoURL && profileAvatar) {
        profileAvatar.innerHTML = `<img src="${user.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">${cameraBadgeHTML}`;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            userName.textContent = data.displayName || userName.textContent;
            if (data.email) userEmail.textContent = data.email;
            if (data.photoURL && profileAvatar) {
                profileAvatar.innerHTML = `<img src="${data.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">${cameraBadgeHTML}`;
            }
        }
    } catch (e) {
        console.error("Error loading user data:", e);
    }
}

function localizeUI() {
    const trans = getTranslations();
    const h1 = document.querySelector(".category-header h1");
    if (h1) h1.textContent = trans.profile;

    const items = document.querySelectorAll(".profile-item-text");
    if (items.length >= 6) {
        items[0].textContent = trans.my_ads;
        items[1].textContent = trans.my_chats;
        items[2].textContent = trans.saved;
        items[3].textContent = trans.settings;
        items[4].textContent = trans.help_support;
        items[5].textContent = trans.about_sellby;
    }

    if (logoutBtn) logoutBtn.textContent = trans.logout;

    // Bottom Nav
    const navSmalls = document.querySelectorAll(".bottom-nav small");
    if (navSmalls.length >= 4) {
        navSmalls[0].textContent = trans.home;
        navSmalls[1].textContent = trans.saved;
        navSmalls[2].textContent = trans.chat;
        navSmalls[3].textContent = trans.profile;
    }
}

auth.onAuthStateChanged(loadUserData);

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
        }
    });
}

if (profileAvatar) {
    profileAvatar.addEventListener("click", () => {
        window.location.href = "edit-profile.html";
    });
}
