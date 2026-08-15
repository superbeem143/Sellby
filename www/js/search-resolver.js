/* ===================================================== */
/*              SELLBY SEARCH-RESOLVER.JS               */
/* ===================================================== */

/**
 * Universal Search Intent Resolver
 * Normalizes input and identifies the most relevant category and keywords.
 */

const CATEGORY_MAP = {
    // Property
    "property": ["property", "house", "flat", "apartment", "villa", "land", "plot", "bhk", "home", "నివాసం", "ఇల్లు", "స్థలం", "బిహెచ్కే", "घर", "मकान", "ज़मीन", "villas", "flats", "apartments", "houses"],
    "mobile": ["mobile", "phone", "iphone", "samsung", "tablet", "ipad", "android", "మొబైల్", "ఫోన్", "मोबाइल", "फ़ोन", "phones", "mobiles", "tablets", "ipads"],
    "cars": ["car", "cars", "swift", "toyota", "honda", "hyundai", "suv", "sedan", "కారు", "కార్లు", "कार", "गाड़ी", "maruti", "mahindra", "tata", "kia", "bmw", "audi", "mercedes"],
    "bikes": ["bike", "motorcycle", "scooter", "activa", "royal enfield", "బైక్", "మోటార్ సైకిల్", "స్కూటర్", "बाइक", "स्कूटर", "bikes", "motorcycles", "scooters", "bullet", "pulsar", "splendor"],
    "electronics": ["laptop", "computer", "pc", "tv", "camera", "fridge", "refrigerator", "washing machine", "gadget", "ల్యాప్‌టాప్", "టీవీ", "కెమెరా", "ఫ్రిజ్", "వాషింగ్ మెషీన్", "लैपटॉप", "टीवी", "कैमरा", "फ्रिज", "वाशिंग मशीन", "laptops", "computers", "fridges", "cameras", "washing machines", "washing-machine", "ac", "air conditioner"],
    "furniture": ["sofa", "bed", "table", "chair", "furniture", "cupboard", "సోఫా", "బెడ్", "టేబుల్", "కుర్చీ", "ఫర్నిచర్", "సోఫా", "బेड", "టేబుల్", "కుర్చీ", "ఫర్నిచర్", "sofas", "beds", "tables", "chairs", "wardrobe"]
};

const NORMALIZATION_MAP = {
    "2 bhk": "2bhk",
    "two bhk": "2bhk",
    "3 bhk": "3bhk",
    "three bhk": "3bhk",
    "i phone": "iphone",
    "refrigerator": "fridge",
    "washing machines": "washing machine",
    "washing-machine": "washing machine",
    "computers": "computer",
    "laptops": "laptop",
    "mobiles": "mobile",
    "bikes": "bike",
    "cars": "car",
    "houses": "house",
    "flats": "flat",
    "apartments": "apartment",
    "villas": "villa",
    "ipads": "ipad",
    "tablets": "tablet",
    "sofas": "sofa",
    "beds": "bed",
    "tables": "table",
    "chairs": "chair",
    "fridges": "fridge",
    "cameras": "camera"
};

// Patterns to strip (Stop words/Intents like "I want", "मुझे चाहिए", etc.)
const STOP_WORDS = [
    "i want", "i need", "looking for", "search", "find", "show me", "buy", "want to buy",
    "నాకు", "కావాలి", "చూపిం", "వెతుకుతున్నాను", "కొనాలనుకుంటున్నాను",
    "मुझे", "चाहिए", "दिखाओ", "ढूंढ रहा हूँ", "खरीदना है"
];

export function resolveSearchIntent(rawQuery) {
    if (!rawQuery) return { category: null, keyword: "", original: "" };

    let query = rawQuery.toLowerCase().trim();

    // 1. Strip Stop Words
    STOP_WORDS.forEach(word => {
        query = query.replace(word, "").trim();
    });

    // 2. Normalization
    Object.keys(NORMALIZATION_MAP).forEach(key => {
        const regex = new RegExp("\\b" + key + "\\b", "g");
        query = query.replace(regex, NORMALIZATION_MAP[key]);
    });

    // 3. Category Detection
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

    // Special case for Cars/Bikes page logic
    if (detectedCategory === "bikes") detectedCategory = "cars";

    return {
        category: detectedCategory,
        keyword: query,
        original: rawQuery
    };
}
