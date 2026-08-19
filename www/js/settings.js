import { auth, db, signOut, getDoc, doc } from "./firebase-config.js";
import { isAuthorizedAdmin } from "./admin-auth.js";
import { getLanguage, setLanguage, initTranslations } from "./i18n.js";

const logoutBtn = document.getElementById("logoutBtn");
const langItem = document.getElementById("langItem");
const langModal = document.getElementById("langModal");
const closeLangModal = document.getElementById("closeLangModal");
const langOptions = document.querySelectorAll(".lang-option");

// =========================
// LOGOUT
// =========================

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "login.html";
        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to logout. Please try again.");
        }
    });
}

// =========================
// LANGUAGE MODAL
// =========================

function updateLanguageSelection() {
    const current = getLanguage();

    langOptions.forEach(option => {
        const check = option.querySelector(".check");

        if (option.dataset.lang === current) {
            option.style.borderColor = "#7c3aed";
            option.style.background = "#f5f3ff";

            if (check) {
                check.style.display = "block";
            }
        } else {
            option.style.borderColor = "#e2e8f0";
            option.style.background = "#f8fafc";

            if (check) {
                check.style.display = "none";
            }
        }
    });
}

if (langItem && langModal) {
    langItem.addEventListener("click", event => {
        event.preventDefault();

        updateLanguageSelection();
        langModal.style.display = "flex";
    });
}

// =========================
// CLOSE LANGUAGE MODAL
// =========================

if (closeLangModal && langModal) {
    closeLangModal.addEventListener("click", () => {
        langModal.style.display = "none";
    });
}

// Close when clicking outside modal
if (langModal) {
    langModal.addEventListener("click", event => {
        if (event.target === langModal) {
            langModal.style.display = "none";
        }
    });
}

// =========================
// LANGUAGE SELECTION
// =========================

langOptions.forEach(option => {
    option.addEventListener("click", () => {
        const selected = option.dataset.lang;

        if (!["en", "te", "hi"].includes(selected)) {
            return;
        }

        setLanguage(selected);

        if (langModal) {
            langModal.style.display = "none";
        }

        window.location.reload();
    });
});

// =========================
// INITIALIZE TRANSLATIONS
// =========================

document.addEventListener("DOMContentLoaded", () => {
    initTranslations();

    const langSubText = document.querySelector(".lang-subtext");

    if (langSubText) {
        const lang = getLanguage();

        const names = {
            en: "English",
            te: "తెలుగు",
            hi: "हिन्दी"
        };

        langSubText.textContent = names[lang] || "English";
    }
});

// =========================
// ADMIN PORTAL VISIBILITY CHECK
// =========================

async function isSellbyAdminAuthenticated(user) {
    const targetAdminEmail = "sellby369@gmail.com";

    // 1. Check passed user object email
    if (user) {
        let email = (user.email || "").trim().toLowerCase();
        if (!email && user.providerData && user.providerData.length > 0) {
            email = (user.providerData[0].email || "").trim().toLowerCase();
        }
        if (email === targetAdminEmail) return true;
    }

    // 2. Check auth.currentUser directly
    if (auth.currentUser) {
        let email = (auth.currentUser.email || "").trim().toLowerCase();
        if (!email && auth.currentUser.providerData && auth.currentUser.providerData.length > 0) {
            email = (auth.currentUser.providerData[0].email || "").trim().toLowerCase();
        }
        if (email === targetAdminEmail) return true;
    }

    // 3. Check Firestore user profile if UID is available
    const activeUid = user?.uid || auth.currentUser?.uid;
    if (activeUid) {
        try {
            const userDocSnap = await getDoc(doc(db, "users", activeUid));
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (data && data.email && data.email.trim().toLowerCase() === targetAdminEmail) {
                    return true;
                }
            }
        } catch (err) {
            console.warn("Notice checking user document email:", err);
        }
    }

    // 4. Check LocalStorage Firebase Auth persistence keys
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("firebase:authUser:")) {
                const val = localStorage.getItem(key);
                if (val && val.toLowerCase().includes(targetAdminEmail)) {
                    const parsed = JSON.parse(val);
                    const storedEmail = (parsed.email || (parsed.providerData && parsed.providerData[0] && parsed.providerData[0].email) || "").trim().toLowerCase();
                    if (storedEmail === targetAdminEmail) {
                        return true;
                    }
                }
            }
        }
    } catch (e) {
        console.warn("Notice reading localStorage auth persistence:", e);
    }

    return false;
}

async function updateAdminPortalVisibility(user) {
    const adminHeader = document.getElementById("adminHeaderLabel");
    const adminSection = document.getElementById("adminPortalSection");

    if (!adminHeader && !adminSection) return;

    const isAdmin = await isSellbyAdminAuthenticated(user);

    if (isAdmin) {
        if (adminHeader) adminHeader.style.display = "block";
        if (adminSection) adminSection.style.display = "block";
    } else {
        if (adminHeader) adminHeader.style.display = "none";
        if (adminSection) adminSection.style.display = "none";
    }
}

// 1. Listen for auth state changes
auth.onAuthStateChanged((user) => {
    updateAdminPortalVisibility(user);
});

// 2. Immediate evaluation if auth.currentUser is already initialized
if (auth.currentUser) {
    updateAdminPortalVisibility(auth.currentUser);
}

// 3. Fallback evaluation on DOMContentLoaded and load
document.addEventListener("DOMContentLoaded", () => {
    updateAdminPortalVisibility(auth.currentUser);
});

window.addEventListener("load", () => {
    updateAdminPortalVisibility(auth.currentUser);
});

// 4. Polling check during initial session load (3 seconds)
let pollCount = 0;
const pollInterval = setInterval(() => {
    pollCount++;
    updateAdminPortalVisibility(auth.currentUser);
    if (pollCount >= 10) {
        clearInterval(pollInterval);
    }
}, 300);


