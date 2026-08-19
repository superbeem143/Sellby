/* ===================================================== */
/*               SELLBY ADMIN-PORTAL.JS                  */
/*          Functional Admin Panel Controller            */
/* ===================================================== */

import { auth, db, getDocs, collection, doc, updateDoc, setDoc, serverTimestamp } from "./firebase-config.js";
import { isAuthorizedAdmin, clearAdminSession, logAdminAction, getAdminCredentials, hashPassword, verifySecretPassword } from "./admin-auth.js";

// Product categories in SELLBY
const CATEGORIES = ["ads", "property", "cars", "bikes", "mobiles", "electronics", "furniture", "others"];

let allUsers = [];
let allAds = [];

// INITIALIZE PORTAL
document.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            alert("Admin Session Expired: Please log in with the Authorized Admin Email.");
            clearAdminSession();
            window.location.replace("index.html");
            return;
        }

        const isAdmin = await isAuthorizedAdmin(user);
        if (!isAdmin) {
            alert("Access Denied: Account is not authorized for Admin access.");
            clearAdminSession();
            window.location.replace("index.html");
            return;
        }

        const adminEmailElem = document.getElementById("adminUserEmail");
        if (adminEmailElem) adminEmailElem.textContent = user.email;

        initTabNavigation();
        initThreeDotsMenu();
        initDashboardCardClicks();

        // Load Initial Dashboard Data
        loadDashboardStats();
        loadOperationalHealth();
        loadUsers();
        loadAds();
        loadReports();
        loadMonetizationPlans();
        loadPaymentHistory();
        loadAuditLogs();
        loadSettingsForm();
    });

    // Exit Button
    document.getElementById("adminLogoutBtn")?.addEventListener("click", async () => {
        if (confirm("End Admin Session and return to app?")) {
            await logAdminAction("ADMIN_LOGOUT", "AUTH", auth.currentUser?.email || "Admin");
            clearAdminSession();
            window.location.href = "settings.html";
        }
    });
});

// GLOBAL TAB NAVIGATION
window.navigateToTab = function(targetTab, statusFilter = "all") {
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");
    const adminSidebar = document.getElementById("adminSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    let actualTab = targetTab;
    if (targetTab.startsWith("ads-") || targetTab === "ads") {
        actualTab = "ads";
        if (targetTab === "ads-active") statusFilter = "published";
        else if (targetTab === "ads-sold") statusFilter = "sold";
        else if (targetTab === "ads-expired") statusFilter = "expired";
        else if (targetTab === "ads-blocked") statusFilter = "blocked";
        else if (targetTab === "ads-all" || targetTab === "ads") statusFilter = "all";
    }

    navItems.forEach(n => {
        const itemTab = n.dataset.tab;
        if (itemTab === targetTab || (actualTab === "ads" && itemTab.startsWith("ads-"))) {
            n.classList.add("active");
        } else if (itemTab === actualTab) {
            n.classList.add("active");
        } else {
            n.classList.remove("active");
        }
    });

    tabPanes.forEach(p => p.classList.remove("active"));
    const targetPane = document.getElementById(`tab-${actualTab}`);
    if (targetPane) targetPane.classList.add("active");

    if (adminSidebar) adminSidebar.classList.remove("open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");

    // Apply ad status filter if navigating to ads
    if (actualTab === "ads") {
        const statusSelect = document.getElementById("adStatusFilter");
        if (statusSelect) {
            statusSelect.value = statusFilter;
        }
        filterAds();
    }

    // Toggle Floating Back to Dashboard Button
    const floatingBtn = document.getElementById("floatingBackDashboardBtn");
    if (floatingBtn) {
        floatingBtn.style.display = actualTab === "dashboard" ? "none" : "flex";
    }

    // Refresh pane data
    if (actualTab === "dashboard") { loadDashboardStats(); loadOperationalHealth(); }
    if (actualTab === "users") loadUsers();
    if (actualTab === "ads") loadAds();
    if (actualTab === "reports") loadReports();
    if (actualTab === "monetization") { loadMonetizationPlans(); loadPaymentHistory(); }
    if (actualTab === "audit") loadAuditLogs();
    if (actualTab === "settings") loadSettingsForm();
};

function initTabNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const adminSidebar = document.getElementById("adminSidebar");
    const adminMainContent = document.getElementById("adminMainContent");
    const sidebarCollapseBtn = document.getElementById("sidebarCollapseBtn");
    const sidebarToggleMobile = document.getElementById("sidebarToggleMobile");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.dataset.tab;
            window.navigateToTab(targetTab);
        });
    });

    // Collapse / Expand Desktop Sidebar
    if (sidebarCollapseBtn && adminSidebar && adminMainContent) {
        sidebarCollapseBtn.addEventListener("click", () => {
            const isCollapsed = adminSidebar.classList.toggle("collapsed");
            adminMainContent.classList.toggle("sidebar-collapsed", isCollapsed);

            const toggleIcon = sidebarCollapseBtn.querySelector(".toggle-icon");
            const toggleText = sidebarCollapseBtn.querySelector(".toggle-text");

            if (isCollapsed) {
                if (toggleIcon) toggleIcon.textContent = "→";
                if (toggleText) toggleText.textContent = "";
            } else {
                if (toggleIcon) toggleIcon.textContent = "←";
                if (toggleText) toggleText.textContent = "Collapse Sidebar";
            }
        });
    }

    // Mobile Drawer Toggle
    if (sidebarToggleMobile && adminSidebar && sidebarOverlay) {
        sidebarToggleMobile.addEventListener("click", () => {
            adminSidebar.classList.toggle("open");
            sidebarOverlay.classList.toggle("active");
        });

        sidebarOverlay.addEventListener("click", () => {
            adminSidebar.classList.remove("open");
            sidebarOverlay.classList.remove("active");
        });
    }
}

// DASHBOARD CARD CLICKS
function initDashboardCardClicks() {
    document.getElementById("dashTotalUsersCard")?.addEventListener("click", () => {
        window.navigateToTab("users");
    });

    document.getElementById("dashTotalAdsCard")?.addEventListener("click", () => {
        window.navigateToTab("ads-all");
    });

    document.getElementById("dashActiveAdsCard")?.addEventListener("click", () => {
        window.navigateToTab("ads-active");
    });

    document.getElementById("dashSoldAdsCard")?.addEventListener("click", () => {
        window.navigateToTab("ads-sold");
    });

    document.getElementById("dashExpiredAdsCard")?.addEventListener("click", () => {
        window.navigateToTab("ads-expired");
    });

    document.getElementById("dashBlockedAdsCard")?.addEventListener("click", () => {
        window.navigateToTab("ads-blocked");
    });
}

// THREE DOTS MENU
function initThreeDotsMenu() {
    const btn = document.getElementById("threeDotsBtn");
    const menu = document.getElementById("threeDotsMenu");

    if (btn && menu) {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target) && e.target !== btn) {
                menu.classList.remove("active");
            }
        });
    }

    document.getElementById("menuBtnChangePass")?.addEventListener("click", () => {
        menu?.classList.remove("active");
        window.navigateToTab("settings");
    });

    document.getElementById("menuBtnSecurityInfo")?.addEventListener("click", () => {
        menu?.classList.remove("active");
        const user = auth.currentUser;
        alert(`SECURITY & SESSION INFORMATION:\n\n` +
              `• Admin Identity: ${user ? user.email : 'None'}\n` +
              `• Status: Authenticated Admin Session\n` +
              `• Firebase Project: mvr-properties-64922\n` +
              `• Auth Mode: Persistent Local Storage\n` +
              `• Authorization Guard: STRICT (sellby369@gmail.com only)`);
    });

    document.getElementById("menuBtnExit")?.addEventListener("click", async () => {
        menu?.classList.remove("active");
        if (confirm("End Admin Session and return to app?")) {
            await logAdminAction("ADMIN_LOGOUT", "AUTH", auth.currentUser?.email || "Admin");
            clearAdminSession();
            window.location.href = "settings.html";
        }
    });
}

// HELPER FOR AD EXPIRY CALCULATION
function calculateAdExpiryInfo(ad) {
    let pubDate = null;
    if (ad.createdAt) {
        pubDate = ad.createdAt.seconds ? new Date(ad.createdAt.seconds * 1000) : new Date(ad.createdAt);
    } else if (ad.publishedAt) {
        pubDate = ad.publishedAt.seconds ? new Date(ad.publishedAt.seconds * 1000) : new Date(ad.publishedAt);
    } else if (ad.timestamp) {
        pubDate = ad.timestamp.seconds ? new Date(ad.timestamp.seconds * 1000) : new Date(ad.timestamp);
    } else {
        pubDate = new Date();
    }

    const durationDays = Number(ad.durationDays || ad.planDuration || 30);
    const expiryDate = new Date(pubDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    const now = new Date();
    const diffMillis = expiryDate.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMillis / (1000 * 60 * 60 * 24));
    const isExpired = remainingDays <= 0;

    return {
        publishedDateStr: pubDate.toLocaleDateString(),
        expiryDateStr: expiryDate.toLocaleDateString(),
        durationDays: durationDays,
        remainingDaysStr: isExpired ? `Expired (${Math.abs(remainingDays)} days ago)` : `${remainingDays} Days Left`,
        isExpired: isExpired
    };
}

function getEffectiveAdStatus(ad) {
    const rawStatus = (ad.status || "published").toLowerCase();
    if (rawStatus === "blocked") return "blocked";
    if (rawStatus === "sold") return "sold";
    if (rawStatus === "expired") return "expired";

    const expiryInfo = calculateAdExpiryInfo(ad);
    if (expiryInfo.isExpired) {
        return "expired";
    }
    return "published";
}

// 1. DASHBOARD STATS
async function loadDashboardStats() {
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsersElem = document.getElementById("dashTotalUsers");
        if (totalUsersElem) totalUsersElem.textContent = usersSnap.size.toLocaleString();

        let totalAdsCount = 0;
        let activeAdsCount = 0;
        let soldAdsCount = 0;
        let expiredAdsCount = 0;
        let blockedAdsCount = 0;

        for (const cat of CATEGORIES) {
            try {
                const catSnap = await getDocs(collection(db, cat));
                totalAdsCount += catSnap.size;
                catSnap.forEach(docSnap => {
                    const data = docSnap.data();
                    const status = getEffectiveAdStatus(data);
                    if (status === "published" || status === "available") {
                        activeAdsCount++;
                    } else if (status === "sold") {
                        soldAdsCount++;
                    } else if (status === "expired") {
                        expiredAdsCount++;
                    } else if (status === "blocked") {
                        blockedAdsCount++;
                    }
                });
            } catch (e) {}
        }

        const dashTotalAds = document.getElementById("dashTotalAds");
        const dashActiveAds = document.getElementById("dashActiveAds");
        const dashSoldAds = document.getElementById("dashSoldAds");
        const dashExpiredAds = document.getElementById("dashExpiredAds");
        const dashBlockedAds = document.getElementById("dashBlockedAds");

        if (dashTotalAds) dashTotalAds.textContent = totalAdsCount.toLocaleString();
        if (dashActiveAds) dashActiveAds.textContent = activeAdsCount.toLocaleString();
        if (dashSoldAds) dashSoldAds.textContent = soldAdsCount.toLocaleString();
        if (dashExpiredAds) dashExpiredAds.textContent = expiredAdsCount.toLocaleString();
        if (dashBlockedAds) dashBlockedAds.textContent = blockedAdsCount.toLocaleString();
    } catch (e) {
        console.error("Error loading dashboard stats:", e);
    }
}

// OPERATIONAL HEALTH SUMMARY
async function loadOperationalHealth() {
    const authElem = document.getElementById("healthAuthStatus");
    const dbElem = document.getElementById("healthFirestoreStatus");
    const usersElem = document.getElementById("healthUsersCount");
    const adsElem = document.getElementById("healthAdsCount");

    if (authElem) {
        authElem.textContent = auth.currentUser ? `Connected (${auth.currentUser.email})` : "Not available";
    }

    try {
        const usersSnap = await getDocs(collection(db, "users"));
        if (dbElem) dbElem.textContent = "Connected & Operational";
        if (usersElem) usersElem.textContent = `Available (${usersSnap.size} records)`;
    } catch (e) {
        if (dbElem) dbElem.textContent = "Not available";
        if (usersElem) usersElem.textContent = "Not available";
    }

    try {
        let totalAds = 0;
        for (const cat of CATEGORIES) {
            try {
                const snap = await getDocs(collection(db, cat));
                totalAds += snap.size;
            } catch (e) {}
        }
        if (adsElem) adsElem.textContent = `Available (${totalAds} listings)`;
    } catch (e) {
        if (adsElem) adsElem.textContent = "Not available";
    }
}

// 2. USERS MANAGEMENT
async function loadUsers() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;">Loading users...</td></tr>`;

    try {
        const snap = await getDocs(collection(db, "users"));
        allUsers = [];
        snap.forEach(d => {
            allUsers.push({ id: d.id, ...d.data() });
        });

        renderUsersList(allUsers);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:20px;">Error loading users: ${e.message}</td></tr>`;
    }
}

function renderUsersList(users) {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">No registered users found in Firestore.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const isSuspended = user.status === "suspended";
        const statusClass = isSuspended ? "suspended" : "active";
        const statusLabel = isSuspended ? "Suspended" : "Active";
        const displayName = user.displayName || user.name || "SELLBY Member";

        return `
            <tr>
                <td>
                    <div style="font-weight:700;">${escapeHtml(displayName)}</div>
                    <div style="font-size:12px;color:#94a3b8;">UID: ${user.id}</div>
                </td>
                <td><span style="font-size:13px;color:#cbd5e1;font-weight:500;">${escapeHtml(displayName)}</span></td>
                <td><span class="status-pill ${statusClass}">${statusLabel}</span></td>
                <td>${user.createdAt ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                    ${isSuspended 
                        ? `<button class="btn-action btn-restore" onclick="toggleUserStatus('${user.id}', 'active')">Restore</button>`
                        : `<button class="btn-action btn-suspend" onclick="toggleUserStatus('${user.id}', 'suspended')">Suspend</button>`
                    }
                </td>
            </tr>
        `;
    }).join("");
}

document.getElementById("userSearchInput")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    const filtered = allUsers.filter(u => 
        (u.displayName || u.name || "").toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term)
    );
    renderUsersList(filtered);
});

window.toggleUserStatus = async function(userId, newStatus) {
    const actionLabel = newStatus === "suspended" ? "suspend" : "restore";
    if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) return;

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { status: newStatus, updatedAt: serverTimestamp() });
        await logAdminAction(newStatus === "suspended" ? "USER_SUSPENDED" : "USER_RESTORED", "USER", userId, { newStatus });
        alert(`User successfully ${newStatus}.`);
        loadUsers();
    } catch (e) {
        alert("Failed to update user status: " + e.message);
    }
};

// 3. ADS MANAGEMENT
async function loadAds() {
    const grid = document.getElementById("adsGrid");
    if (!grid) return;

    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;">Loading ads...</div>`;

    try {
        allAds = [];
        for (const cat of CATEGORIES) {
            try {
                const catSnap = await getDocs(collection(db, cat));
                catSnap.forEach(d => {
                    const docData = d.data();
                    allAds.push({
                        id: d.id,
                        _collectionName: cat, // Exact Firestore collection name where this doc lives!
                        category: docData.category || cat,
                        ...docData
                    });
                });
            } catch (e) {}
        }

        filterAds();
    } catch (e) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:#ef4444;padding:30px;">Error loading ads: ${e.message}</div>`;
    }
}

function renderAdsGrid(ads) {
    const grid = document.getElementById("adsGrid");
    if (!grid) return;

    if (ads.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px;color:#94a3b8;">No ads match the selected filter criteria.</div>`;
        return;
    }

    grid.innerHTML = ads.map(ad => {
        const thumb = (ad.imageUrls && ad.imageUrls.length > 0) ? ad.imageUrls[0] : "images/sellby-logo.png";
        const title = ad.title || (ad.brand ? `${ad.brand} ${ad.model || ''}` : "Untitled Listing");
        const price = Number(ad.price || 0).toLocaleString("en-IN");
        const status = getEffectiveAdStatus(ad);
        const sellerUid = ad.sellerId || ad.userId || "UID: Unknown";

        return `
            <div class="ad-card-item">
                <img src="${thumb}" alt="${escapeHtml(title)}" class="ad-card-img" onerror="this.src='images/sellby-logo.png'">
                <div class="ad-card-body">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
                        <h4 class="ad-card-title">${escapeHtml(title)}</h4>
                        <span class="status-pill ${status}">${status}</span>
                    </div>
                    <div class="ad-card-price">₹${price}</div>
                    <div class="ad-card-meta">
                        <div>📁 ${ad.category.toUpperCase()} | 📍 ${escapeHtml(ad.location || 'N/A')}</div>
                        <div>👤 Seller UID: ${escapeHtml(sellerUid.substring(0, 14))}...</div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:auto;">
                        <button class="btn-action btn-edit" onclick="inspectAdDetails('${ad.id}')">Inspect Details</button>
                        <select class="form-control" style="height:32px;font-size:11px;padding:4px;" onchange="changeAdStatus('${ad.id}', this.value)">
                            <option value="published" ${status === 'published' ? 'selected' : ''}>Published</option>
                            <option value="sold" ${status === 'sold' ? 'selected' : ''}>Sold</option>
                            <option value="expired" ${status === 'expired' ? 'selected' : ''}>Expired</option>
                            <option value="blocked" ${status === 'blocked' ? 'selected' : ''}>Blocked</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

document.getElementById("adSearchInput")?.addEventListener("input", filterAds);
document.getElementById("adCategoryFilter")?.addEventListener("change", filterAds);
document.getElementById("adStatusFilter")?.addEventListener("change", filterAds);

function filterAds() {
    const term = (document.getElementById("adSearchInput")?.value || "").toLowerCase().trim();
    const cat = document.getElementById("adCategoryFilter")?.value || "all";
    const stat = document.getElementById("adStatusFilter")?.value || "all";

    const filtered = allAds.filter(ad => {
        const matchesTerm = (ad.title || "").toLowerCase().includes(term) || (ad.sellerId || ad.userId || "").toLowerCase().includes(term);
        const matchesCat = cat === "all" || ad.category === cat;
        const currentStatus = getEffectiveAdStatus(ad);
        
        let matchesStat = true;
        if (stat === "published") {
            matchesStat = currentStatus === "published" || currentStatus === "available";
        } else if (stat === "sold") {
            matchesStat = currentStatus === "sold";
        } else if (stat === "expired") {
            matchesStat = currentStatus === "expired";
        } else if (stat === "blocked") {
            matchesStat = currentStatus === "blocked";
        }

        return matchesTerm && matchesCat && matchesStat;
    });

    renderAdsGrid(filtered);
}

// AD DETAILS INSPECTION MODAL & BLOCKING
let currentTargetAdIdForBlock = null;
let currentTargetCategoryForBlock = null;

window.inspectAdDetails = function(adId) {
    const ad = allAds.find(a => a.id === adId);
    if (!ad) return;

    currentTargetAdIdForBlock = adId;
    currentTargetCategoryForBlock = ad._collectionName || "ads";

    const modal = document.getElementById("adDetailModal");
    if (!modal) return;

    const expiryInfo = calculateAdExpiryInfo(ad);
    const effectiveStatus = getEffectiveAdStatus(ad);

    document.getElementById("modalAdTitle").textContent = ad.title || "Ad Inspection Details";
    const imgElem = document.getElementById("modalAdImage");
    if (imgElem) {
        imgElem.src = (ad.imageUrls && ad.imageUrls.length > 0) ? ad.imageUrls[0] : "images/sellby-logo.png";
    }

    document.getElementById("modalAdCategory").textContent = ad.category.toUpperCase();
    document.getElementById("modalAdPrice").textContent = `₹${Number(ad.price || 0).toLocaleString('en-IN')}`;
    document.getElementById("modalAdLocation").textContent = ad.location || "N/A";
    document.getElementById("modalAdStatus").textContent = effectiveStatus.toUpperCase();

    document.getElementById("modalAdPublishedDate").textContent = expiryInfo.publishedDateStr;
    document.getElementById("modalAdExpiryDate").textContent = expiryInfo.expiryDateStr;
    document.getElementById("modalAdDuration").textContent = `${expiryInfo.durationDays} Days`;
    document.getElementById("modalAdRemainingDays").textContent = expiryInfo.remainingDaysStr;

    document.getElementById("modalAdSeller").textContent = ad.sellerId || ad.userId || "UID: Unknown Seller";
    document.getElementById("modalAdDescription").textContent = ad.description || ad.details || "No description provided.";

    const blockBtn = document.getElementById("modalBlockAdBtn");
    if (blockBtn) {
        if (effectiveStatus === "blocked") {
            blockBtn.textContent = "🚫 Ad is Blocked";
            blockBtn.disabled = true;
            blockBtn.style.opacity = "0.5";
            blockBtn.onclick = null;
        } else {
            blockBtn.textContent = "🚫 Block Ad";
            blockBtn.disabled = false;
            blockBtn.style.opacity = "1";
            blockBtn.onclick = () => {
                closeAdModal();
                openBlockAdModal(adId, ad._collectionName || "ads");
            };
        }
    }

    modal.style.display = "flex";
};

window.closeAdModal = function() {
    const modal = document.getElementById("adDetailModal");
    if (modal) modal.style.display = "none";
};

window.changeAdStatus = async function(adId, newStatus) {
    const ad = allAds.find(a => a.id === adId);
    if (!ad) return;

    const targetCollection = ad._collectionName || "ads";

    try {
        const adRef = doc(db, targetCollection, adId);
        await updateDoc(adRef, { status: newStatus, updatedAt: serverTimestamp() });
        await logAdminAction("AD_ACTION", "AD", adId, { category: targetCollection, newStatus });
        loadDashboardStats();
        loadAds();
    } catch (e) {
        alert("Failed to update ad status: " + e.message);
    }
};

// BLOCK AD MODERATION MODAL
window.openBlockAdModal = function(adId, category) {
    currentTargetAdIdForBlock = adId;
    currentTargetCategoryForBlock = category;

    const statusElem = document.getElementById("blockAdModalStatusMsg");
    if (statusElem) statusElem.style.display = "none";

    const modal = document.getElementById("blockAdModal");
    if (modal) modal.style.display = "flex";
};

window.closeBlockAdModal = function() {
    const modal = document.getElementById("blockAdModal");
    if (modal) modal.style.display = "none";
};

document.getElementById("confirmBlockAdBtn")?.addEventListener("click", async () => {
    if (!currentTargetAdIdForBlock) return;

    const adObj = allAds.find(a => a.id === currentTargetAdIdForBlock);
    const targetCollection = (adObj && adObj._collectionName) ? adObj._collectionName : (currentTargetCategoryForBlock || "ads");
    const sellerUid = adObj ? (adObj.sellerId || adObj.userId || "UNKNOWN") : "UNKNOWN";

    const reasonSelect = document.getElementById("blockReasonSelect");
    const customReasonInput = document.getElementById("blockReasonCustom");
    const selectedReason = reasonSelect ? reasonSelect.value : "Policy violation";
    const customNotes = customReasonInput ? customReasonInput.value.trim() : "";
    const finalReason = customNotes ? `${selectedReason} - ${customNotes}` : selectedReason;
    const adminEmail = auth.currentUser?.email || "sellby369@gmail.com";

    const confirmBtn = document.getElementById("confirmBlockAdBtn");
    if (confirmBtn) confirmBtn.disabled = true;

    try {
        const adRef = doc(db, targetCollection, currentTargetAdIdForBlock);
        await updateDoc(adRef, {
            status: "blocked",
            blockReason: finalReason,
            blockedBy: adminEmail,
            blockedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        await logAdminAction("BLOCK_AD", "AD", currentTargetAdIdForBlock, {
            collection: targetCollection,
            category: adObj?.category || targetCollection,
            sellerUid: sellerUid,
            blockReason: finalReason,
            blockedBy: adminEmail
        });

        showBlockStatus("Ad listing blocked successfully!", true);

        setTimeout(() => {
            closeBlockAdModal();
            if (confirmBtn) confirmBtn.disabled = false;
            loadDashboardStats();
            loadAds();
        }, 800);
    } catch (err) {
        console.error("Error blocking ad in Firestore:", err);
        showBlockStatus(`Failed to block ad: ${err.message}`, false);
        if (confirmBtn) confirmBtn.disabled = false;
    }
});

function showBlockStatus(msg, isSuccess = false) {
    const statusElem = document.getElementById("blockAdModalStatusMsg");
    if (statusElem) {
        statusElem.textContent = msg;
        statusElem.style.display = "block";
        statusElem.style.color = isSuccess ? "#4ade80" : "#fca5a5";
        statusElem.style.background = isSuccess ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)";
        statusElem.style.border = isSuccess ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)";
    }
}

// 4. REPORTS & MODERATION
async function loadReports() {
    const tbody = document.getElementById("reportsTableBody");
    if (!tbody) return;

    try {
        const snap = await getDocs(collection(db, "safetyReports"));
        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">No safety or moderation reports currently filed.</td></tr>`;
            return;
        }

        let html = "";
        snap.forEach(d => {
            const r = d.data();
            html += `
                <tr>
                    <td>${escapeHtml(d.id.substring(0, 10))}...</td>
                    <td><span style="font-size:12px;color:#94a3b8;">UID: ${escapeHtml(r.reporterUid || r.reporterId || r.userId || 'Anonymous')}</span></td>
                    <td><strong style="color:#f59e0b;">${escapeHtml(r.reason || r.category || 'General')}</strong></td>
                    <td>${r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleString() : 'N/A'}</td>
                    <td><span class="status-pill active">${r.status || 'PENDING'}</span></td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">No safety or moderation reports currently filed.</td></tr>`;
    }
}

// 5. MONETIZATION & PLANS
const DEFAULT_PLANS = [
    { id: "plan_1m", name: "1 Month Renewal", durationDays: 30, priceINR: 199, active: true },
    { id: "plan_3m", name: "3 Months Renewal", durationDays: 90, priceINR: 499, active: true },
    { id: "plan_6m", name: "6 Months Renewal", durationDays: 180, priceINR: 899, active: true },
    { id: "plan_1y", name: "1 Year Renewal", durationDays: 365, priceINR: 1499, active: true }
];

async function loadMonetizationPlans() {
    const container = document.getElementById("plansListContainer");
    if (!container) return;

    try {
        const snap = await getDocs(collection(db, "plans"));
        let plans = [];
        if (snap.empty) {
            for (const p of DEFAULT_PLANS) {
                await setDoc(doc(db, "plans", p.id), p);
            }
            plans = DEFAULT_PLANS;
        } else {
            snap.forEach(d => plans.push({ id: d.id, ...d.data() }));
        }

        container.innerHTML = plans.map(p => `
            <div class="stat-card" style="border-left: 4px solid var(--primary);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div class="stat-title">${escapeHtml(p.name)} (${p.durationDays} Days)</div>
                    <span class="status-pill ${p.active ? 'active' : 'expired'}">${p.active ? 'Active' : 'Disabled'}</span>
                </div>
                <div style="display:flex;align-items:center;gap:10px;margin:12px 0;">
                    <span style="font-size:24px;font-weight:800;color:#c084fc;">₹</span>
                    <input type="number" id="price_${p.id}" class="form-control" style="width:120px;font-size:18px;font-weight:700;" value="${p.priceINR}">
                </div>
                <div style="display:flex;gap:10px;margin-top:8px;">
                    <button class="btn-action btn-edit" onclick="updatePlanPrice('${p.id}')">Save Price</button>
                    <button class="btn-action ${p.active ? 'btn-suspend' : 'btn-restore'}" onclick="togglePlanActive('${p.id}', ${!p.active})">
                        ${p.active ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = `<div style="color:#ef4444;">Error loading plans: ${e.message}</div>`;
    }
}

window.updatePlanPrice = async function(planId) {
    const input = document.getElementById(`price_${planId}`);
    const newPrice = Number(input.value);
    if (isNaN(newPrice) || newPrice < 0) {
        alert("Please enter a valid price amount.");
        return;
    }

    try {
        await updateDoc(doc(db, "plans", planId), { priceINR: newPrice, updatedAt: serverTimestamp() });
        await logAdminAction("PLAN_PRICE_CHANGED", "PLAN", planId, { newPrice });
        alert("Plan price updated successfully!");
        loadMonetizationPlans();
    } catch (e) {
        alert("Error updating plan: " + e.message);
    }
};

window.togglePlanActive = async function(planId, newActiveState) {
    try {
        await updateDoc(doc(db, "plans", planId), { active: newActiveState, updatedAt: serverTimestamp() });
        await logAdminAction("PLAN_TOGGLED", "PLAN", planId, { active: newActiveState });
        alert(`Plan ${newActiveState ? 'enabled' : 'disabled'} successfully.`);
        loadMonetizationPlans();
    } catch (e) {
        alert("Error toggling plan state: " + e.message);
    }
};

// Payment History
async function loadPaymentHistory() {
    const tbody = document.getElementById("paymentsTableBody");
    if (!tbody) return;

    try {
        const snap = await getDocs(collection(db, "payments"));
        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#94a3b8;">No payment transactions recorded yet.</td></tr>`;
            return;
        }

        let html = "";
        snap.forEach(d => {
            const p = d.data();
            html += `
                <tr>
                    <td>${escapeHtml(d.id.substring(0, 10))}...</td>
                    <td>${escapeHtml(p.userId || 'N/A')}</td>
                    <td>${escapeHtml(p.adId || 'N/A')}</td>
                    <td>₹${Number(p.amount || 0).toLocaleString('en-IN')}</td>
                    <td><span class="status-pill ${p.status === 'SUCCESS' ? 'active' : 'expired'}">${p.status || 'SUCCESS'}</span></td>
                    <td>${p.createdAt ? new Date(p.createdAt.seconds ? p.createdAt.seconds * 1000 : p.createdAt).toLocaleString() : 'N/A'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No payment records recorded yet.</td></tr>`;
    }
}

// 6. AUDIT LOGS
async function loadAuditLogs() {
    const tbody = document.getElementById("auditLogsTableBody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;">Loading audit logs...</td></tr>`;

    try {
        const snap = await getDocs(collection(db, "adminLogs"));
        if (snap.empty) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">No audit log records available.</td></tr>`;
            return;
        }

        const logs = [];
        snap.forEach(d => logs.push({ id: d.id, ...d.data() }));

        logs.sort((a, b) => {
            const tA = a.timestamp?.seconds || 0;
            const tB = b.timestamp?.seconds || 0;
            return tB - tA;
        });

        tbody.innerHTML = logs.map(l => `
            <tr>
                <td>${escapeHtml(l.adminEmail || l.adminId || 'System')}</td>
                <td><strong style="color:#c084fc;">${escapeHtml(l.action)}</strong></td>
                <td>${escapeHtml(l.targetType || 'N/A')} / ${escapeHtml(l.targetId || 'N/A')}</td>
                <td>${l.timestamp ? new Date(l.timestamp.seconds ? l.timestamp.seconds * 1000 : l.timestamp).toLocaleString() : 'Just now'}</td>
                <td style="font-size:12px;color:#94a3b8;">${escapeHtml(JSON.stringify(l.details || {}))}</td>
            </tr>
        `).join("");
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:20px;">Unable to load audit logs: ${e.message}</td></tr>`;
    }
}

// 7. ADMIN SETTINGS
async function loadSettingsForm() {
    const emailInput = document.getElementById("adminGmailInput");
    if (emailInput) {
        emailInput.value = "sellby369@gmail.com";
    }
}

document.getElementById("changePasswordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusMsg = document.getElementById("passwordChangeStatusMessage");
    const navActions = document.getElementById("passwordChangeNavActions");
    const currentPass = document.getElementById("currentPasswordInput")?.value.trim();
    const newPass = document.getElementById("newPasswordInput")?.value.trim();
    const confirmPass = document.getElementById("confirmPasswordInput")?.value.trim();

    function showStatus(msg, isSuccess = false) {
        if (statusMsg) {
            statusMsg.textContent = msg;
            statusMsg.style.display = "block";
            statusMsg.style.color = isSuccess ? "#4ade80" : "#ef4444";
            statusMsg.style.background = isSuccess ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)";
            statusMsg.style.border = isSuccess ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)";
        }
    }

    if (!currentPass) {
        showStatus("Current password is required.");
        return;
    }

    // 1. Verify Current Admin Password
    const isCurrentValid = await verifySecretPassword(currentPass);
    if (!isCurrentValid) {
        showStatus("Current password is incorrect.");
        if (navActions) navActions.style.display = "none";
        return;
    }

    // 2. Validate New Password Match
    if (newPass !== confirmPass) {
        showStatus("New passwords do not match.");
        if (navActions) navActions.style.display = "none";
        return;
    }

    // 3. Validate New Password Length
    if (!newPass || newPass.length < 6) {
        showStatus("New password must be at least 6 characters long.");
        if (navActions) navActions.style.display = "none";
        return;
    }

    // 4. Update Password Hash with fresh salt in Firestore
    try {
        const freshSalt = "SELLBY_ADMIN_" + Math.random().toString(36).substring(2, 10);
        const newHash = await hashPassword(newPass, freshSalt);

        await setDoc(doc(db, "adminConfig", "credentials"), {
            adminEmail: "sellby369@gmail.com",
            salt: freshSalt,
            passwordHash: newHash,
            isInitialized: true,
            updatedAt: serverTimestamp()
        }, { merge: true });

        await logAdminAction("ADMIN_PASSWORD_CHANGED", "AUTH", auth.currentUser?.email || "Admin", { method: "Admin Settings Password Form" });

        showStatus("Admin password changed successfully.", true);
        document.getElementById("changePasswordForm").reset();

        if (navActions) navActions.style.display = "flex";
    } catch (err) {
        showStatus("Failed to change password: " + err.message);
    }
});

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
}
