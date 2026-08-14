/* ===================================================== */
/*              SELLBY SPEECH-PARSER.JS                  */
/* ===================================================== */

export function parseSpeech(text) {
    const result = {
        category: "others",
        price: "",
        location: "",
        brand: "",
        model: "",
        condition: "",
        storage: "",
        title: "",
        description: text.trim()
    };

    const speech = text.toLowerCase();

    // 1. Category Detection (Matching HTML File Names)
    if (speech.includes("car")) {
        result.category = "car";
    } else if (speech.includes("bike") || speech.includes("motorcycle")) {
        result.category = "bike";
    } else if (speech.includes("mobile") || speech.includes("phone") || speech.includes("smartphone")) {
        result.category = "mobile";
    } else if (speech.includes("property") || speech.includes("plot") || speech.includes("house") || speech.includes("land")) {
        result.category = "property";
    } else if (speech.includes("electronics") || speech.includes("laptop") || speech.includes("tv") || speech.includes("computer")) {
        result.category = "electronics";
    } else if (speech.includes("furniture") || speech.includes("chair") || speech.includes("table") || speech.includes("sofa")) {
        result.category = "furniture";
    }

    // 2. Price Detection
    const priceMatch = speech.match(/\d+/);
    if (priceMatch) {
        result.price = priceMatch[0];
    }

    // 3. Location Detection
    const locations = ["hyderabad", "vijayawada", "visakhapatnam", "tirupati", "guntur", "warangal", "palakollu", "bhimavaram", "rajahmundry"];
    locations.forEach(loc => {
        if (speech.includes(loc)) result.location = loc;
    });

    // 4. Brand Detection
    const brands = ["samsung", "apple", "iphone", "oneplus", "xiaomi", "redmi", "realme", "vivo", "oppo", "nokia", "sony", "hp", "dell", "lenovo"];
    brands.forEach(b => {
        if (speech.includes(b)) result.brand = b;
    });

    // 5. Model/Storage/Condition (Simple Regex)
    const storageMatch = speech.match(/\b(32|64|128|256|512)\s?(gb|tb)\b/i);
    if (storageMatch) result.storage = storageMatch[0];

    if (speech.includes("new")) result.condition = "New";
    else if (speech.includes("good") || speech.includes("excellent")) result.condition = "Used - Like New";
    else if (speech.includes("used")) result.condition = "Used";

    // 6. Title Generation
    if (result.brand) {
        result.title = `Selling ${result.brand.toUpperCase()}`;
    } else {
        result.title = text.substring(0, 50);
    }

    return result;
}
