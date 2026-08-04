import { db } from "./firebase-config.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const publishBtn = document.querySelector(".publish-btn");

publishBtn.addEventListener("click", async () => {

  const title = document.querySelector('input[type="text"]').value.trim();

  const price = document.querySelector('input[type="number"]').value.trim();

  const location = document.querySelector('input[placeholder*="City"]').value.trim();

  const description = document.querySelector("textarea").value.trim();
   if (!title || !price || !location || !description) {
    alert("Please fill all required fields.");
    return;
  }

  try {

    await addDoc(collection(db, "properties"), {
      title: title,
      price: Number(price),
      location: location,
      description: description,
      status: "available",
      createdAt: serverTimestamp()
    });
        alert("Property Published Successfully!");

    window.location.href = "../property.html";

  } catch (error) {

    console.error(error);

    alert("Failed to publish property. Please try again.");

  }

}); 