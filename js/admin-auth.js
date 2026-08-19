/* ===================================================== */
/*               SELLBY ADMIN-AUTH.JS                    */
/* ===================================================== */

import { auth, db, doc, getDoc, setDoc, serverTimestamp, GoogleAuthProvider, signInWithPopup } from "./firebase-config.js";

// Utility: SHA-256 password hashing via Web Crypto API
export async function hashPassword(password, salt = "SELLBY_ADMIN_SALT_2026") {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Fixed single authorized admin email configuration
export const AUTHORIZED_ADMIN_EMAIL = "sellby369@gmail.com";
const DEFAULT_SALT = "SELLBY_ADMIN_SALT_2026";

// Helper check: Strictly ONLY exact authorized admin email (sellby369@gmail.com) is allowed
export async function isAuthorizedAdmin(user) {
    if (!user) return false;
    let email = (user.email || "").trim().toLowerCase();
    if (!email && user.providerData && user.providerData.length > 0) {
        email = (user.providerData[0].email || "").trim().toLowerCase();
    }
    if (!email) return false;
    const adminEmailLower = AUTHORIZED_ADMIN_EMAIL.trim().toLowerCase();
    return email === adminEmailLower;
}

// Get admin credentials from Firestore
export async function getAdminCredentials() {
    try {
        const credRef = doc(db, "adminConfig", "credentials");
        const snap = await getDoc(credRef);
        if (snap.exists()) {
            return snap.data();
        }
        return null;
    } catch (e) {
        console.warn("Notice reading admin credentials:", e);
        return null;
    }
}

const BOOTSTRAP_CREDENTIAL = "999999";

// Verify first-time temporary bootstrap password (999999)
export function verifyBootstrapPassword(enteredCode) {
    if (!enteredCode) return false;
    return enteredCode.trim() === BOOTSTRAP_CREDENTIAL;
}

// Check if secret admin password has been set up
export async function isAdminPasswordInitialized() {
    const creds = await getAdminCredentials();
    return !!(creds && creds.passwordHash && creds.isInitialized === true);
}

// Initialize secret admin password on first-time setup
export async function initializeAdminPassword(newPassword) {
    const salt = "SELLBY_ADMIN_" + Math.random().toString(36).substring(2, 10);
    const hash = await hashPassword(newPassword, salt);
    const credRef = doc(db, "adminConfig", "credentials");
    const data = {
        adminEmail: AUTHORIZED_ADMIN_EMAIL,
        salt: salt,
        passwordHash: hash,
        isInitialized: true,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
    };
    await setDoc(credRef, data);
    return data;
}

// Verify entered secret password against stored hash
export async function verifySecretPassword(enteredPassword) {
    if (!enteredPassword) return false;
    const creds = await getAdminCredentials();
    if (!creds || !creds.passwordHash) return false;
    const computedHash = await hashPassword(enteredPassword, creds.salt || DEFAULT_SALT);
    return computedHash === creds.passwordHash;
}

// Log administrative actions to auditLogs collection
export async function logAdminAction(action, targetType = "SYSTEM", targetId = "", details = {}) {
    try {
        const user = auth.currentUser;
        const logData = {
            adminId: user ? user.uid : "ANONYMOUS",
            adminEmail: user ? (user.email || user.phoneNumber) : "UNKNOWN",
            action: action,
            targetType: targetType,
            targetId: targetId,
            details: details,
            timestamp: serverTimestamp()
        };

        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js");
        await addDoc(collection(db, "adminLogs"), logData);
    } catch (e) {
        console.warn("Failed to write audit log:", e);
    }
}

// Google Sign-In helper for Admin Gmail
export async function signInWithAdminGmail() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    return result.user;
}

// Session Management
export function setAdminSession(adminEmail) {
    sessionStorage.setItem("adminSessionActive", "true");
    sessionStorage.setItem("adminSessionEmail", adminEmail || "");
    sessionStorage.setItem("adminSessionTime", Date.now().toString());
}

export function clearAdminSession() {
    sessionStorage.removeItem("adminSessionActive");
    sessionStorage.removeItem("adminSessionEmail");
    sessionStorage.removeItem("adminSessionTime");
}

export function isAdminSessionValid() {
    const active = sessionStorage.getItem("adminSessionActive") === "true";
    const sessionTime = parseInt(sessionStorage.getItem("adminSessionTime") || "0", 10);
    // 4-hour session expiry limit
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    if (active && (Date.now() - sessionTime) < FOUR_HOURS) {
        return true;
    }
    clearAdminSession();
    return false;
}
