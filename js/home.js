import { auth, signOut } from "./firebase-config.js";

const menuBtn = document.querySelector(".menu-btn");
const sideMenu = document.getElementById("sideMenu");
const logoutBtn = document.getElementById("logoutBtn");

if (menuBtn && sideMenu) {

    menuBtn.addEventListener("click", () => {

        sideMenu.classList.toggle("show");

    });

}

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        await signOut(auth);

        window.location.href = "login.html";

    });

}
