/* ===================================================== */
/*              SELLBY SPEECH-PARSER.JS                  */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : speech-parser.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Parse Speech
    ✔ Category Detection
    ✔ Price Detection
    ✔ Location Detection
*/
/* ===================================================== */

export function parseSpeech(text) {

    const result = {

        category: "",

        price: "",

        location: ""

    };

    const speech =

        text.toLowerCase();

    if (

        speech.includes("car") ||

        speech.includes("cars")

    ) {

        result.category = "cars";

    }

    else if (

        speech.includes("bike") ||

        speech.includes("motorcycle")

    ) {

        result.category = "bikes";

    }

    else if (

        speech.includes("mobile") ||

        speech.includes("phone") ||

        speech.includes("smartphone")

    ) {

        result.category = "mobiles";

    }

    else if (

        speech.includes("property") ||

        speech.includes("plot") ||

        speech.includes("house")

    ) {

        result.category = "property";

    }

    else if (

        speech.includes("electronics") ||

        speech.includes("laptop") ||

        speech.includes("tv")

    ) {

        result.category = "electronics";

    }

    else if (

        speech.includes("furniture") ||

        speech.includes("chair") ||

        speech.includes("table") ||

        speech.includes("sofa")

    ) {

        result.category = "furniture";

    }

    else {

        result.category = "others";

    }

    const priceMatch =

        speech.match(/\d+/);

    if (priceMatch) {

        result.price =

            priceMatch[0];

    }

    const locationKeywords = [

        "hyderabad",

        "vijayawada",

        "visakhapatnam",

        "tirupati",

        "guntur",

        "warangal",

        "palakollu"

    ];

    locationKeywords.forEach((city) => {

        if (speech.includes(city)) {

            result.location = city;

        }

    });

    return result;

}
/* ===================================================== */
/*              SELLBY SPEECH-PARSER.JS                  */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : speech-parser.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Brand Detection
    ✔ Condition Detection
    ✔ Storage Detection
    ✔ Model Detection
*/
/* ===================================================== */

    const brands = [

        "samsung",

        "apple",

        "iphone",

        "oneplus",

        "xiaomi",

        "redmi",

        "realme",

        "vivo",

        "oppo",

        "nokia",

        "sony",

        "lg",

        "hp",

        "dell",

        "lenovo"

    ];

    result.brand = "";

    brands.forEach((brand) => {

        if (speech.includes(brand)) {

            result.brand = brand;

        }

    });

    result.condition = "";

    if (speech.includes("new")) {

        result.condition = "New";

    }

    else if (

        speech.includes("good") ||

        speech.includes("excellent")

    ) {

        result.condition = "Good";

    }

    else if (

        speech.includes("used")

    ) {

        result.condition = "Used";

    }

    const storageMatch =

        speech.match(

            /\b(32|64|128|256|512|1024)\s?(gb|tb)\b/i

        );

    if (storageMatch) {

        result.storage =

            storageMatch[0];

    }

    const modelMatch =

        speech.match(

            /[a-z]+\s?[a-z0-9\-]+/i

        );

    if (modelMatch) {

        result.model =

            modelMatch[0];

    }
/* ===================================================== */
/*              SELLBY SPEECH-PARSER.JS                  */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : speech-parser.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Title Generation
    ✔ Description Generation
    ✔ Final Cleanup
    ✔ Return Parsed Result
*/
/* ===================================================== */

    if (

        result.brand &&

        result.model

    ) {

        result.title =

            `${result.brand.toUpperCase()} ${result.model}`;

    }

    else {

        result.title =

            speech.substring(0, 60);

    }

    result.description =

        text.trim();

    Object.keys(result).forEach((key) => {

        if (

            typeof result[key] === "string"

        ) {

            result[key] =

                result[key].trim();

        }

    });

    return result;

}    