import { auth, signOut } from "./firebase-config.js";
import { getLanguage, setLanguage, getTranslations, initTranslations } from "./i18n.js";

const logoutBtn = document.getElementById('logoutBtn');
const langItem = document.getElementById('langItem');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to logout. Please try again.");
        }
    });
}

const langModal = document.getElementById('langModal');
const closeLangModal = document.getElementById('closeLangModal');
const langOptions = document.querySelectorAll('.lang-option');

if (langItem && langModal) {
    langItem.addEventListener('click', (e) => {
        e.preventDefault();
        langModal.style.display = 'flex';

        // Highlight current
        const current = getLanguage();
        langOptions.forEach(opt => {
            const check = opt.querySelector('.check');
            if (opt.dataset.lang === current) {
                opt.style.borderColor = '#7c3aed';
                opt.style.background = '#f5f3ff';
                if (check) check.style.display = 'block';
            } else {
                opt.style.borderColor = '#e2e8f0';
                opt.style.background = '#f8fafc';
                if (check) check.style.display = 'none';
            }
        });
    });
}

if (closeLangModal) {
    closeLangModal.addEventListener('click', () => {
        langModal.style.display = 'none';
    });
}

langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = btn.dataset.lang;
        setLanguage(selected);
        langModal.style.display = 'none';
        // Reload is necessary to apply to all modules
        location.reload();
    });
});

// Update the displayed language in the UI
document.addEventListener('DOMContentLoaded', () => {
    initTranslations();

    // Additional specific logic for settings (like language name display)
    const langSubText = document.querySelector('.lang-subtext');
    if (langSubText) {
        const lang = getLanguage();
        const names = { en: "English", te: "తెలుగు", hi: "हिन्दी" };
        langSubText.textContent = names[lang] || "English";
    }
});
