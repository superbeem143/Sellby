import { auth, signOut } from "./firebase-config.js";
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
