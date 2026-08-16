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


                    /*
                     * UNIQUE FILE NAME
                     *
                     * This prevents old browser cache
                     * from showing the previous photo.
                     */

                    const extension =
                        getFileExtension(
                            selectedFile
                        );

                    const fileName =
                        `avatar_${Date.now()}.${extension}`;


                    const storagePath =
                        `profiles/${user.uid}/${fileName}`;


                    const storageRef =
                        ref(
                            storage,
                            storagePath
                        );


                    /*
                     * Upload image to Firebase Storage
                     */

                    await uploadBytes(
                        storageRef,
                        selectedFile,
                        {
                            contentType:
                                selectedFile.type,
                            cacheControl:
                                "public,max-age=31536000"
                        }
                    );


                    /*
                     * Get Firebase download URL
                     */

                    const downloadURL =
                        await getDownloadURL(
                            storageRef
                        );


                    /*
                     * Cache-busting URL
                     */

                    photoURL =
                        addCacheBuster(
                            downloadURL
                        );

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
   FILE
