import {
    auth,
    db,
    storage,
    doc,
    getDoc,
    setDoc,
    updateProfile,
    ref,
    uploadBytes,
    getDownloadURL
} from "./firebase-config.js";
import { getTranslations, t, initTranslations } from "./i18n.js";

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

auth.onAuthStateChanged(async (user) => {
    if (user) {
        initTranslations();
        editName.value = user.displayName || "";
        editEmail.value = user.email || "";
        editPhone.value = user.phoneNumber || "";

        if (user.photoURL) {
            profilePreview.src = user.photoURL;
            profilePreview.style.display = "block";
            profilePlaceholder.style.display = "none";
        }

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.displayName) editName.value = data.displayName;
                if (data.email) editEmail.value = data.email;
            }
        } catch (e) {
            console.error("User doc fetch error:", e);
        }
    } else {
        window.location.href = "login.html";
    }
});

function localizeUI() {
    const trans = getTranslations();
    const h1 = document.querySelector(".category-title-area h1");
    const p = document.querySelector(".category-title-area p");
    if (h1) h1.textContent = trans.edit_profile;

    const labels = document.querySelectorAll("label");
    if (labels.length >= 3) {
        labels[0].textContent = "Full Name"; // Hardcoded for now but can be added to i18n
        labels[1].textContent = "Email Address";
        labels[2].textContent = "Phone Number";
    }

    if (saveProfileBtn) saveProfileBtn.textContent = "Save Changes";
}

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

saveProfileBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const name = editName.value.trim();
    const email = editEmail.value.trim();

    if (!name) return;

    saveProfileBtn.disabled = true;
    showStatus(t('loading'), "info");

    try {
        let photoURL = user.photoURL;
        if (selectedFile) {
            const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
            await uploadBytes(storageRef, selectedFile);
            photoURL = await getDownloadURL(storageRef);
        }

        await updateProfile(user, { displayName: name, photoURL: photoURL });
        await setDoc(doc(db, "users", user.uid), {
            displayName: name,
            email: email,
            photoURL: photoURL,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        showStatus(t('success'), "success");
        setTimeout(() => { window.location.href = "profile.html"; }, 1000);
    } catch (error) {
        console.error(error);
        showStatus(t('failed'), "error");
        saveProfileBtn.disabled = false;
    }
});

function showStatus(msg, type) {
    saveStatus.textContent = msg;
    saveStatus.style.display = "block";
    saveStatus.style.color = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#7c3aed";
}
