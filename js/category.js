/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */
/*
    File Name : category.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Category Page Initialization
    ✔ Page Ready Event
    ✔ Category Click Animation
*/
/* ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("SELLBY Category Page Loaded");

    const categoryItems =
        document.querySelectorAll(".category-item");

    categoryItems.forEach((item) => {

        item.addEventListener("click", () => {

            item.classList.add("active");

            setTimeout(() => {

                item.classList.remove("active");

            }, 200);

        });

    });

});
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */
/*
    File Name : category.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Active Category Highlight
    ✔ Future Ready Functions
*/
/* ===================================================== */

function setActiveCategory(categoryName) {

    const items =
        document.querySelectorAll(".category-item");

    items.forEach((item) => {

        item.classList.remove("selected");

        if (
            item.textContent
                .trim()
                .includes(categoryName)
        ) {

            item.classList.add("selected");

        }

    });

}

window.setActiveCategory = setActiveCategory;

console.log("SELLBY Category JS Ready");
