import { auth, signOut } from "./firebase-config.js";
import { getLanguage, setLanguage, getTranslations } from "./i18n.js";

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
        location.reload();
    });
});

// Update the displayed language in the UI
document.addEventListener('DOMContentLoaded', () => {
    const trans = getTranslations();

    // Page Header
    const h1 = document.querySelector('.category-title-area h1');
    const p = document.querySelector('.category-title-area p');
    if (h1) h1.textContent = trans.settings_title;
    if (p) p.textContent = trans.settings_subtitle;

    // Menu Items
    const items = document.querySelectorAll('.profile-item-text');
    if (items.length >= 3) {
        items[0].textContent = trans.edit_profile;
        items[1].textContent = trans.profile_photo;
        // Language item has two divs
        const langDivs = items[2].querySelectorAll('div');
        if (langDivs.length >= 2) {
            langDivs[0].textContent = trans.language;
            const lang = getLanguage();
            const names = { en: "English", te: "తెలుగు", hi: "हिन्दी" };
            langDivs[1].textContent = names[lang] || "English";
        }
        if (items.length >= 7) {
            items[3].textContent = trans.notifications;
            items[4].textContent = trans.privacy_policy;
            items[5].textContent = trans.terms_conditions;
            items[6].textContent = trans.help_support;
            items[7].textContent = trans.safety_report;
            items[8].textContent = trans.about_sellby;
        }
    }

    // Section Headers
    const headers = document.querySelectorAll('.profile-page > div[style*="text-transform: uppercase"]');
    if (headers.length >= 2) {
        headers[0].textContent = trans.preferences;
        headers[1].textContent = trans.support;
    }

    // Logout Button
    if (logoutBtn) logoutBtn.textContent = trans.logout;

    // Bottom Nav
    const navSmalls = document.querySelectorAll('.bottom-nav small');
    if (navSmalls.length >= 4) {
        navSmalls[0].textContent = trans.home;
        navSmalls[1].textContent = trans.saved;
        navSmalls[2].textContent = trans.chat;
        navSmalls[3].textContent = trans.profile;
    }
});
