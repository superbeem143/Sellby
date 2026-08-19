/* ===================================================== */
/*              SELLBY FIREBASE-CONFIG.JS                */
/*                  FIREBASE PART 1                      */
/* ===================================================== */
/*
    File Name : firebase-config.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Firebase Imports
    ✔ Firebase Configuration
    ✔ Firebase Initialization
*/
/* ===================================================== */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";

const firebaseConfig = {

    apiKey: "AIzaSyBFSnAwXw6uJB1QZjqT1IHlYBwsS9CsvLw",

    authDomain: "mvr-properties-64922.firebaseapp.com",

    projectId: "mvr-properties-64922",

    storageBucket: "mvr-properties-64922.firebasestorage.app",

    messagingSenderId: "1091310315390",

    appId: "1:1091310315390:web:d7f79a87c0b1024059f52f"

};

let app;

if (!getApps().length) {

    app = initializeApp(firebaseConfig);

} else {

    app = getApp();

}

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence)

.catch((e) => {

    console.warn("Could not set persistence:", e.message || e);

});
/* ===================================================== */
/*              SELLBY FIREBASE-CONFIG.JS                */
/*                  FIREBASE PART 2                      */
/* ===================================================== */
/*
    File Name : firebase-config.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Export Firebase Services
    ✔ Export Authentication Methods
    ✔ Export Firestore Methods
    ✔ Export Storage Methods
*/
/* ===================================================== */

export {

    RecaptchaVerifier,

    signInWithPhoneNumber,

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged,

    sendPasswordResetEmail,

    updateProfile,

    doc,

    setDoc,

    getDoc,

    collection,

    query,

    where,

    getDocs,

    addDoc,

    updateDoc,

    deleteDoc,

    serverTimestamp,

    ref,

    uploadBytes,

    getDownloadURL,

    GoogleAuthProvider,

    signInWithPopup

};
