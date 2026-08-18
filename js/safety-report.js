/* ===================================================== */
/*            SELLBY SAFETY-REPORT.JS                    */
/* ===================================================== */

import { db, auth } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const reportCategory = document.getElementById("reportCategory");
const reportDetails = document.getElementById("reportDetails");
const targetId = document.getElementById("targetId");
const submitReportBtn = document.getElementById("submitReportBtn");

const categoryValidation = document.getElementById("categoryValidation");
const detailsValidation = document.getElementById("detailsValidation");

const reportFormCard = document.getElementById("reportFormCard");
const successCard = document.getElementById("successCard");

function prefillTargetId() {
    const params = new URLSearchParams(window.location.search);
    const adId = params.get("adId") || params.get("targetId") || params.get("userId");
    if (adId && targetId) {
        targetId.value = adId;
    }
}

if (submitReportBtn) {
    submitReportBtn.addEventListener("click", async () => {
        if (categoryValidation) categoryValidation.style.display = "none";
        if (detailsValidation) detailsValidation.style.display = "none";

        const categoryVal = reportCategory ? reportCategory.value.trim() : "";
        const detailsVal = reportDetails ? reportDetails.value.trim() : "";
        const targetVal = targetId ? targetId.value.trim() : "";

        let isValid = true;

        if (!categoryVal) {
            if (categoryValidation) categoryValidation.style.display = "block";
            isValid = false;
        }

        if (!detailsVal) {
            if (detailsValidation) detailsValidation.style.display = "block";
            isValid = false;
        }

        if (!isValid) return;

        if (!auth.currentUser) {
            alert("Please log in to submit a report.");
            window.location.href = "login.html";
            return;
        }

        submitReportBtn.disabled = true;
        submitReportBtn.textContent = "Submitting...";

        try {
            const reportData = {
                reporterId: auth.currentUser.uid,
                reporterEmail: auth.currentUser.email || "",
                category: categoryVal,
                reason: categoryVal,
                description: detailsVal,
                targetId: targetVal,
                status: "pending",
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "reports"), reportData);

            if (reportFormCard) reportFormCard.style.display = "none";
            if (successCard) successCard.style.display = "block";

        } catch (error) {
            console.error("Report submission error:", error);
            alert("Failed to submit report: " + error.message);
            submitReportBtn.disabled = false;
            submitReportBtn.textContent = "Submit Report";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    prefillTargetId();
});
