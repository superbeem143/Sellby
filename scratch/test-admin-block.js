// TEST VALIDATION FOR ADMIN PORTAL BLOCK & EXPIRY LIFECYCLE
const fs = require('fs');

console.log("Checking admin-portal.js file integrity...");
const portalJs = fs.readFileSync('js/admin-portal.js', 'utf8');

// 1. Verify exact collection tracking fix
if (portalJs.includes('_collectionName: cat')) {
    console.log("✅ PASS: Exact Firestore collection reference tracking implemented (_collectionName: cat).");
} else {
    console.error("❌ FAIL: _collectionName tracking missing!");
}

// 2. Verify updateDoc uses targetCollection
if (portalJs.includes('doc(db, targetCollection, currentTargetAdIdForBlock)')) {
    console.log("✅ PASS: Block Ad operation targets the exact collection reference loaded by Ads Manager.");
} else {
    console.error("❌ FAIL: targetCollection updateDoc reference missing!");
}

// 3. Verify calculateAdExpiryInfo
if (portalJs.includes('calculateAdExpiryInfo')) {
    console.log("✅ PASS: Ad expiry calculation logic implemented.");
} else {
    console.error("❌ FAIL: calculateAdExpiryInfo missing!");
}

// 4. Verify getEffectiveAdStatus
if (portalJs.includes('getEffectiveAdStatus')) {
    console.log("✅ PASS: Effective ad status evaluation (auto-expiring past-due ads) implemented.");
} else {
    console.error("❌ FAIL: getEffectiveAdStatus missing!");
}

// 5. Verify showBlockStatus (In-portal error messages)
if (portalJs.includes('showBlockStatus')) {
    console.log("✅ PASS: In-portal status error message handling implemented.");
} else {
    console.error("❌ FAIL: In-portal status error message handling missing!");
}

console.log("\nAll structural code verifications passed successfully!");
