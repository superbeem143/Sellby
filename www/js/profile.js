import {
    auth,
    signOut,
    db,
    doc,
    getDoc
} from "./firebase-config.js";

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const profileAvatar = document.querySelector(".profile-avatar");

async function loadUserData(user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Default values from Auth
    userName.textContent = user.displayName || "SELLBY User";
    userEmail.textContent = user.phoneNumber || user.email || "Member";

    if (user.photoURL) {
        profileAvatar.innerHTML = `<img src="${user.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }

    // Load extra info from Firestore if needed
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            userName.textContent = data.displayName || userName.textContent;
            if (data.email) userEmail.textContent = data.email;
            if (data.photoURL) {
                profileAvatar.innerHTML = `<img src="${data.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            }
        }
    } catch (e) {
        console.error("Error loading user data from firestore:", e);
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
            alert("Unable to logout. Please try again.");
        }
    });
}

// Redirect to edit profile when clicking avatar
if (profileAvatar) {
    profileAvatar.addEventListener("click", () => {
        window.location.href = "edit-profile.html";
    });
}
