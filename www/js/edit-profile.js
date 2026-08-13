import {
    auth,
    db,
    storage,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    updateProfile,
    ref,
    uploadBytes,
    getDownloadURL
} from "./firebase-config.js";

const profilePreview = document.getElementById("profilePreview");
const profilePlaceholder = document.getElementById("profilePlaceholder");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const saveStatus = document.getElementById("saveStatus");

const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const chooseGalleryBtn = document.getElementById("chooseGalleryBtn");

let selectedFile = null;

// Load current profile data
auth.onAuthStateChanged(async (user) => {
    if (user) {
        editName.value = user.displayName || "";
        editEmail.value = user.email || "";
        editPhone.value = user.phoneNumber || "";

        if (user.photoURL) {
            profilePreview.src = user.photoURL;
            profilePreview.style.display = "block";
            profilePlaceholder.style.display = "none";
        }

        // Also check Firestore for additional data if any
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.displayName) editName.value = data.displayName;
                if (data.email) editEmail.value = data.email;
                if (data.photoURL && !user.photoURL) {
                    profilePreview.src = data.photoURL;
                    profilePreview.style.display = "block";
                    profilePlaceholder.style.display = "none";
                }
            }
        } catch (e) {
            console.error("Error fetching user doc:", e);
        }
    } else {
        window.location.href = "login.html";
    }
});

// Image selection
takePhotoBtn.addEventListener("click", () => cameraInput.click());
chooseGalleryBtn.addEventListener("click", () => galleryInput.click());

const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePreview.src = event.target.result;
            profilePreview.style.display = "block";
            profilePlaceholder.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
};

cameraInput.addEventListener("change", handleFile);
galleryInput.addEventListener("change", handleFile);

// Save Profile
saveProfileBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const name = editName.value.trim();
    const email = editEmail.value.trim();

    if (!name) {
        showStatus("Please enter your name.", "error");
        return;
    }

    saveProfileBtn.disabled = true;
    showStatus("Saving changes...", "info");

    try {
        let photoURL = user.photoURL;

        // 1. Upload photo if selected
        if (selectedFile) {
            const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
            await uploadBytes(storageRef, selectedFile);
            photoURL = await getDownloadURL(storageRef);
        }

        // 2. Update Firebase Auth Profile
        await updateProfile(user, {
            displayName: name,
            photoURL: photoURL
        });

        // 3. Update Firestore User Doc
        await setDoc(doc(db, "users", user.uid), {
            displayName: name,
            email: email,
            photoURL: photoURL,
            phoneNumber: user.phoneNumber,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        showStatus("Profile updated successfully!", "success");
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 1500);

    } catch (error) {
        console.error("Error updating profile:", error);
        showStatus("Failed to update profile: " + error.message, "error");
        saveProfileBtn.disabled = false;
    }
});

function showStatus(msg, type) {
    saveStatus.textContent = msg;
    saveStatus.style.display = "block";
    saveStatus.style.color = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#7c3aed";
}
