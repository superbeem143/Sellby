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

import {
    getTranslations,
    t,
    initTranslations
} from "./i18n.js";


/* =========================================================
   EXISTING ELEMENTS
   ========================================================= */

const profilePreview =
    document.getElementById("profilePreview");

const profilePlaceholder =
    document.getElementById("profilePlaceholder");

const editName =
    document.getElementById("editName");

const editEmail =
    document.getElementById("editEmail");

const editPhone =
    document.getElementById("editPhone");

const saveProfileBtn =
    document.getElementById("saveProfileBtn");

const saveStatus =
    document.getElementById("saveStatus");

const cameraInput =
    document.getElementById("cameraInput");

const galleryInput =
    document.getElementById("galleryInput");

const takePhotoBtn =
    document.getElementById("takePhotoBtn");

const chooseGalleryBtn =
    document.getElementById("chooseGalleryBtn");


/* =========================================================
   STATE
   ========================================================= */

let selectedFile = null;


/* =========================================================
   AUTH + LOAD PROFILE
   ========================================================= */

auth.onAuthStateChanged(async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        initTranslations();

        /* Basic Firebase Auth profile */

        editName.value =
            user.displayName || "";

        editEmail.value =
            user.email || "";

        editPhone.value =
            user.phoneNumber || "";


        /* Existing Auth photo */

        if (user.photoURL) {

            showProfilePhoto(user.photoURL);

        }


        /* Load Firestore profile */

        try {

            const userDoc = await getDoc(
                doc(db, "users", user.uid)
            );

            if (userDoc.exists()) {

                const data =
                    userDoc.data();

                if (data.displayName) {
                    editName.value =
                        data.displayName;
                }

                if (data.email) {
                    editEmail.value =
                        data.email;
                }

                /*
                 * IMPORTANT:
                 * Firestore photoURL gets priority.
                 */

                if (data.photoURL) {

                    showProfilePhoto(
                        addCacheBuster(data.photoURL)
                    );

                }

            }

        } catch (error) {

            console.error(
                "Firestore profile load error:",
                error
            );

        }

    } catch (error) {

        console.error(
            "Profile initialization error:",
            error
        );

        showStatus(
            "Unable to load profile.",
            "error"
        );

    }

});


/* =========================================================
   TRANSLATION UI
   ========================================================= */

function localizeUI() {

    const trans = getTranslations();

    const h1 =
        document.querySelector(
            ".category-title-area h1"
        );

    if (h1 && trans.edit_profile) {
        h1.textContent =
            trans.edit_profile;
    }

    const labels =
        document.querySelectorAll("label");

    if (labels.length >= 3) {

        labels[0].textContent =
            "Full Name";

        labels[1].textContent =
            "Email Address";

        labels[2].textContent =
            "Phone Number";
    }

    if (saveProfileBtn) {

        saveProfileBtn.textContent =
            "Save Changes";
    }
}


/* =========================================================
   PHOTO BUTTONS
   ========================================================= */

if (takePhotoBtn) {

    takePhotoBtn.addEventListener(
        "click",
        () => {

            cameraInput.value = "";
            cameraInput.click();

        }
    );

}


if (chooseGalleryBtn) {

    chooseGalleryBtn.addEventListener(
        "click",
        () => {

            galleryInput.value = "";
            galleryInput.click();

        }
    );

}


/* =========================================================
   PHOTO SELECTION
   ========================================================= */

function handleFile(event) {

    const file =
        event.target.files &&
        event.target.files[0];

    if (!file) {
        return;
    }


    /* Only images */

    if (!file.type.startsWith("image/")) {

        showStatus(
            "Please select an image file.",
            "error"
        );

        return;
    }


    /* Keep selected file */

    selectedFile = file;


    /* Immediate preview */

    const reader =
        new FileReader();

    reader.onload = (e) => {

        showProfilePhoto(
            e.target.result
        );

        showStatus(
            "Photo selected. Tap Save Changes.",
            "info"
        );

    };

    reader.onerror = () => {

        showStatus(
            "Unable to preview this photo.",
            "error"
        );

    };

    reader.readAsDataURL(file);

}


if (cameraInput) {

    cameraInput.addEventListener(
        "change",
        handleFile
    );

}


if (galleryInput) {

    galleryInput.addEventListener(
        "change",
        handleFile
    );

}


/* =========================================================
   SHOW PHOTO
   ========================================================= */

function showProfilePhoto(photoURL) {

    if (!profilePreview) {
        return;
    }

    profilePreview.onload = () => {

        profilePreview.style.display =
            "block";

        if (profilePlaceholder) {

            profilePlaceholder.style.display =
                "none";

        }

    };

    profilePreview.onerror = () => {

        profilePreview.style.display =
            "none";

        if (profilePlaceholder) {

            profilePlaceholder.style.display =
                "block";

        }

    };

    profilePreview.src = photoURL;
}


/* =========================================================
   CACHE BUSTER
   ========================================================= */

function addCacheBuster(url) {

    if (!url) {
        return url;
    }

    const separator =
        url.includes("?")
            ? "&"
            : "?";

    return `${url}${separator}v=${Date.now()}`;
}


/* =========================================================
   SAVE PROFILE
   ========================================================= */

if (saveProfileBtn) {

    saveProfileBtn.addEventListener(
        "click",
        async () => {

            const user =
                auth.currentUser;

            if (!user) {

                showStatus(
                    "Please login again.",
                    "error"
                );

                return;
            }


            const name =
                editName.value.trim();

            const email =
                editEmail.value.trim();


            /* Name validation */

            if (!name) {

                showStatus(
                    "Please enter your name.",
                    "error"
                );

                editName.focus();

                return;
            }


            /* Disable button */

            saveProfileBtn.disabled =
                true;

            saveProfileBtn.style.opacity =
                "0.65";

            showStatus(
                "Saving profile...",
                "info"
            );


            try {

                let photoURL =
                    user.photoURL || "";


                /* =================================================
                   UPLOAD NEW PHOTO
                   ================================================= */

                if (selectedFile) {

                    showStatus(
                        "Uploading profile photo...",
                        "info"
                    );

                    photoURL = await uploadPhotoFile(selectedFile, user.uid);

                }


                /* =================================================
                   UPDATE FIREBASE AUTH PROFILE
                   ================================================= */

                showStatus(
                    "Saving profile...",
                    "info"
                );


                await updateProfile(
                    user,
                    {
                        displayName: name,
                        photoURL: photoURL || null
                    }
                );


                /* =================================================
                   UPDATE FIRESTORE PROFILE
                   ================================================= */

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {
                        displayName: name,

                        email: email,

                        phoneNumber:
                            user.phoneNumber || "",

                        photoURL:
                            photoURL || "",

                        updatedAt:
                            new Date().toISOString()

                    },
                    {
                        merge: true
                    }
                );


                /* =================================================
                   SUCCESS
                   ================================================= */

                selectedFile = null;


                showStatus(
                    "Profile saved successfully!",
                    "success"
                );


                /*
                 * Keep the new image visible
                 */

                if (photoURL) {

                    showProfilePhoto(
                        photoURL
                    );

                }


                /*
                 * Give Firebase/UI time to finish
                 */

                setTimeout(() => {

                    window.location.href =
                        "profile.html";

                }, 1200);


            } catch (error) {

                console.error(
                    "PROFILE SAVE ERROR:",
                    error
                );


                /*
                 * Show useful error
                 */

                let message =
                    "Unable to save profile.";


                if (
                    error &&
                    error.code ===
                    "storage/unauthorized"
                ) {

                    message =
                        "Photo upload permission denied.";

                } else if (
                    error &&
                    error.code ===
                    "storage/unauthenticated"
                ) {

                    message =
                        "Firebase login session expired.";

                } else if (
                    error &&
                    error.code ===
                    "permission-denied"
                ) {

                    message =
                        "Profile database permission denied.";

                } else if (
                    error &&
                    error.message
                ) {

                    console.error(
                        error.message
                    );

                }


                showStatus(
                    message,
                    "error"
                );


                saveProfileBtn.disabled =
                    false;

                saveProfileBtn.style.opacity =
                    "1";

            }

        }
    );

}


/* =========================================================
   HELPER FUNCTIONS
   ========================================================= */

function getFileExtension(file) {
    if (!file || !file.name) return "jpg";
    const parts = file.name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
}

function showStatus(message, type = "info") {
    if (!saveStatus) return;
    saveStatus.textContent = message;
    saveStatus.style.display = "block";
    if (type === "error") {
        saveStatus.style.color = "#dc2626";
    } else if (type === "success") {
        saveStatus.style.color = "#16a34a";
    } else {
        saveStatus.style.color = "#7c3aed";
    }
}

async function uploadPhotoFile(file, uid) {
    const extension = getFileExtension(file);
    const fileName = `avatar_${Date.now()}.${extension}`;

    // 1. Try Firebase Storage upload with timeout
    try {
        const storagePath = `profiles/${uid}/${fileName}`;
        const storageRef = ref(storage, storagePath);

        const uploadPromise = uploadBytes(storageRef, file, {
            contentType: file.type,
            cacheControl: "public,max-age=31536000"
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firebase Storage timeout")), 6000)
        );

        await Promise.race([uploadPromise, timeoutPromise]);
        const downloadURL = await getDownloadURL(storageRef);
        return addCacheBuster(downloadURL);
    } catch (fbError) {
        console.warn("Firebase Storage upload fallback triggered:", fbError.message || fbError);

        // 2. Fallback to Cloudinary (used across SELLBY post pages)
        const CLOUD_NAME = "onrnn2hn";
        const UPLOAD_PRESET = "mvrproperties";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const resp = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            throw new Error(errData.error?.message || "Photo upload failed.");
        }

        const data = await resp.json();
        return addCacheBuster(data.secure_url);
    }
}


