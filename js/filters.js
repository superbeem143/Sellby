/* ===================================================== */
/*                 SELLBY FILTERS.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : filters.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ DOM Elements
    ✔ Filter Values
    ✔ Apply Filters
*/
/* ===================================================== */

const categoryFilter =

    document.getElementById("categoryFilter");

const locationFilter =

    document.getElementById("locationFilter");

const minPrice =

    document.getElementById("minPrice");

const maxPrice =

    document.getElementById("maxPrice");

const sortFilter =

    document.getElementById("sortFilter");

function applyFilters(data) {

    let results = [...data];

    if (categoryFilter.value) {

        results = results.filter(

            item =>

                item.category ===

                categoryFilter.value

        );

    }

    if (locationFilter.value.trim()) {

        const location =

            locationFilter.value

            .trim()

            .toLowerCase();

        results = results.filter(

            item =>

                (item.location || "")

                .toLowerCase()

                .includes(location)

        );

    }

    return results;

}
/* ===================================================== */
/*                 SELLBY FILTERS.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : filters.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Price Filter
    ✔ Sort Results
    ✔ Return Filtered Data
*/
/* ===================================================== */

    if (minPrice.value) {

        results = results.filter(

            item =>

                Number(item.price || 0) >=

                Number(minPrice.value)

        );

    }

    if (maxPrice.value) {

        results = results.filter(

            item =>

                Number(item.price || 0) <=

                Number(maxPrice.value)

        );

    }

    switch (sortFilter.value) {

        case "low-high":

            results.sort(

                (a, b) =>

                    Number(a.price || 0) -

                    Number(b.price || 0)

            );

            break;

        case "high-low":

            results.sort(

                (a, b) =>

                    Number(b.price || 0) -

                    Number(a.price || 0)

            );

            break;

        case "oldest":

            results.reverse();

            break;

        default:

            break;

    }

    return results;

}
/* ===================================================== */
/*                 SELLBY FILTERS.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */
/*
    File Name : filters.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Filter Events
    ✔ Live Filtering
    ✔ Initialize Filters
*/
/* ===================================================== */

function refreshFilters() {

    if (

        typeof allResults === "undefined" ||

        typeof displayResults !== "function"

    ) {

        return;

    }

    const filteredResults =

        applyFilters(allResults);

    displayResults(filteredResults);

}

categoryFilter.addEventListener(

    "change",

    refreshFilters

);

locationFilter.addEventListener(

    "input",

    refreshFilters

);

minPrice.addEventListener(

    "input",

    refreshFilters

);

maxPrice.addEventListener(

    "input",

    refreshFilters

);

sortFilter.addEventListener(

    "change",

    refreshFilters

);

document.addEventListener(

    "DOMContentLoaded",

    refreshFilters

);
