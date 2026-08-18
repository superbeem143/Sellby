/* ===================================================== */
/*              SELLBY SEARCH-RESOLVER.JS               */
/* ===================================================== */

/**
 * Universal Search Intent Resolver with Property Micro-Category Normalization
 */

const STOP_WORDS = [
    "i want", "i need", "looking for", "search", "find", "show me", "buy", "want to buy", "for sale", "in",
    "నాకు", "కావాలి", "చూపిం", "వెతుకుతున్నాను", "కొనాలనుకుంటున్నాను", "ఉంది",
    "मुझे", "चाहिए", "दिखाओ", "ढूंढ रहा हूँ", "खरीदना है"
];

// Property Micro-Category Mapping Rules
const PROPERTY_MICRO_CATEGORIES = [
    {
        name: "2 BHK",
        display: "Properties → 2 BHK",
        patterns: [
            /\b2\s*bhk\b/i, /\b2\s*bh\b/i, /\b2\s*bedroom\b/i, /\b2\s*bedrooms\b/i,
            /\b2bhk\b/i, /\b2bh\b/i, /బిహెచ్కే/i, /2bhk/i
        ]
    },
    {
        name: "3 BHK",
        display: "Properties → 3 BHK",
        patterns: [
            /\b3\s*bhk\b/i, /\b3\s*bh\b/i, /\b3\s*bedroom\b/i, /\b3\s*bedrooms\b/i,
            /\b3bhk\b/i, /\b3bh\b/i
        ]
    },
    {
        name: "Open Plot",
        display: "Properties → Open Plot",
        patterns: [
            /\bopen\s*plot\b/i, /\bopen\s*plots\b/i, /\bresidential\s*plot\b/i, /\bresidential\s*plots\b/i,
            /\bplot\b/i, /\bplots\b/i, /ప్లాట్/i, /ఓపెన్ ప్లాట్/i, /प्लॉट/i, /ज़मीन/i
        ]
    },
    {
        name: "Apartment",
        display: "Properties → Apartment",
        patterns: [
            /\bapartment\b/i, /\bapartments\b/i, /\bflat\b/i, /\bflats\b/i, /ఫ్లాట్/i, /ఫ్లాట్లు/i
        ]
    },
    {
        name: "House",
        display: "Properties → House",
        patterns: [
            /\bindependent\s*house\b/i, /\bhouse\b/i, /\bhouses\b/i, /\bhome\b/i, /\bhomes\b/i,
            /ఇల్లు/i, /మకాన్/i, /मकान/i, /घर/i
        ]
    },
    {
        name: "Farm Land",
        display: "Properties → Farm Land",
        patterns: [
            /\bfarm\s*land\b/i, /\bfarmland\b/i, /\bfarm\s*land\s*property\b/i, /ఫార్మ్ ల్యాండ్/i, /ఫార్మ్‌ల్యాండ్/i
        ]
    },
    {
        name: "Commercial",
        display: "Properties → Commercial",
        patterns: [
            /\bcommercial\b/i, /\bcommercial\s*property\b/i, /\bshop\b/i, /\bshops\b/i, /\boffice\b/i, /\boffices\b/i
        ]
    }
];

const CATEGORY_MAP = {
    "property": ["property", "house", "flat", "apartment", "villa", "land", "plot", "bhk", "home", "నివాసం", "ఇల్లు", "స్థలం", "బిహెచ్కే", "घर", "मकान", "ज़मीन", "villas", "flats", "apartments", "houses", "farmland"],
    "mobile": ["mobile", "phone", "iphone", "samsung", "tablet", "ipad", "android", "మొబైల్", "ఫోన్", "मोबाइल", "फ़ोन", "phones", "mobiles", "tablets", "ipads"],
    "cars": ["car", "cars", "swift", "toyota", "honda", "hyundai", "suv", "sedan", "కారు", "కార్లు", "कार", "गाड़ी", "maruti", "mahindra", "tata", "kia", "bmw", "audi", "mercedes"],
    "bikes": ["bike", "motorcycle", "scooter", "activa", "royal enfield", "బైక్", "మోటార్ సైకిల్", "స్కూటర్", "बाइक", "स्कूटर", "bikes", "motorcycles", "scooters", "bullet", "pulsar", "splendor"],
    "electronics": ["laptop", "computer", "pc", "tv", "camera", "fridge", "refrigerator", "washing machine", "gadget", "ల్యాప్‌టాప్", "టీవీ", "కెమెరా", "ఫ్రిజ్", "వాషింగ్ మెషీన్", "लैपटॉप", "टीवी", "कैमरा", "फ्रिज", "वाशिंग मशीन", "laptops", "computers", "fridges", "cameras", "washing machines", "ac", "air conditioner"],
    "furniture": ["sofa", "bed", "table", "chair", "furniture", "cupboard", "సోఫా", "బెడ్", "టేబుల్", "కుర్చీ", "ఫర్నిచర్", "sofas", "beds", "tables", "chairs", "wardrobe"]
};

export function resolveSearchIntent(rawQuery) {
    if (!rawQuery) {
        return { category: null, microCategory: null, displayLabel: null, keyword: "", original: "" };
    }

    let query = rawQuery.toLowerCase().trim();

    // 1. Strip Stop Words / Filler Words
    STOP_WORDS.forEach(word => {
        query = query.replace(word, "").trim();
    });

    // 2. Check for Property Micro-Category match
    for (const micro of PROPERTY_MICRO_CATEGORIES) {
        for (const pattern of micro.patterns) {
            if (pattern.test(query) || pattern.test(rawQuery)) {
                return {
                    category: "property",
                    microCategory: micro.name,
                    displayLabel: micro.display,
                    keyword: query,
                    original: rawQuery
                };
            }
        }
    }

    // 3. Main Category Detection (if no micro-category matched)
    let detectedCategory = null;
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
        for (const kw of keywords) {
            if (query.includes(kw)) {
                detectedCategory = cat;
                break;
            }
        }
        if (detectedCategory) break;
    }

    if (detectedCategory === "bikes") detectedCategory = "cars";

    return {
        category: detectedCategory,
        microCategory: null,
        displayLabel: null,
        keyword: query,
        original: rawQuery
    };
}

/**
 * Checks if a property ad matches the detected micro-category
 */
export function matchesPropertyMicroCategory(ad, microCategory) {
    if (!ad || ad.category !== "property") return false;
    if (!microCategory) return true;

    const type = (ad.type || "").toLowerCase();
    const title = (ad.title || "").toLowerCase();
    const desc = (ad.description || "").toLowerCase();
    const textToMatch = `${type} ${title} ${desc}`;

    switch (microCategory) {
        case "2 BHK":
            return /\b2\s*bhk\b/i.test(textToMatch) || /\b2bhk\b/i.test(textToMatch) || /\b2\s*bh\b/i.test(textToMatch) || /\b2bh\b/i.test(textToMatch) || /\b2\s*bedroom\b/i.test(textToMatch);
        case "3 BHK":
            return /\b3\s*bhk\b/i.test(textToMatch) || /\b3bhk\b/i.test(textToMatch) || /\b3\s*bh\b/i.test(textToMatch) || /\b3bh\b/i.test(textToMatch) || /\b3\s*bedroom\b/i.test(textToMatch);
        case "Open Plot":
            return type.includes("plot") || type.includes("land") || textToMatch.includes("plot") || textToMatch.includes("open plot") || textToMatch.includes("land");
        case "Apartment":
            return type.includes("apartment") || type.includes("flat") || textToMatch.includes("apartment") || textToMatch.includes("flat");
        case "House":
            return type.includes("house") || type.includes("villa") || textToMatch.includes("house") || textToMatch.includes("villa") || textToMatch.includes("home");
        case "Farm Land":
            return textToMatch.includes("farm") || textToMatch.includes("farmland") || textToMatch.includes("agricultural");
        case "Commercial":
            return type.includes("commercial") || textToMatch.includes("commercial") || textToMatch.includes("shop") || textToMatch.includes("office");
        default:
            return true;
    }
}
