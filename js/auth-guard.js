/* ===================================================== */
/*               SELLBY AUTH-GUARD.JS                    */
/* ===================================================== */

import { auth } from "./firebase-config.js";
import { initTranslations } from "./i18n.js";

// Safe helper to reveal body and apply ready classes
function revealBody() {
    if (document.body) {
        document.body.style.visibility = "visible";
        document.body.classList.add("auth-ready");
        document.body.classList.add("page-loaded");
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            if (document.body) {
                document.body.style.visibility = "visible";
                document.body.classList.add("auth-ready");
                document.body.classList.add("page-loaded");
            }
        }, { once: true });
    }
}

// Global Smooth Navigation Helper
window.smoothNavigate = function(url) {
    if (!url) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.location.href = url;
        return;
    }
    if (document.body) {
        document.body.classList.add("page-exiting");
    }
    setTimeout(() => {
        window.location.href = url;
    }, 140);
};

// Initialize smooth page transition handlers
function initPageTransitions() {
    // Intercept internal link navigation for smooth exit animation
    document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("tel:") || href.startsWith("mailto:")) return;
        if (link.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;

        const targetUrl = new URL(link.href, window.location.origin);
        if (targetUrl.origin === window.location.origin) {
            e.preventDefault();
            window.smoothNavigate(link.href);
        }
    });

    // Handle bfcache & back button navigation smoothly
    window.addEventListener("pageshow", () => {
        if (document.body) {
            document.body.classList.remove("page-exiting");
            revealBody();
        }
    });
}

initPageTransitions();

auth.onAuthStateChanged((user) => {
    if (user) {
        initTranslations();
        revealBody();
    } else {
        // Only redirect if NOT on an auth page or admin page
        const path = window.location.pathname;
        if (path.includes("login.html") || path.includes("register.html") || path.includes("forgot-password.html") || path.includes("admin-")) {
            initTranslations();
            revealBody();
        } else {
            window.location.replace("login.html");
        }
    }
});
