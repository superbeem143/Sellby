/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 1                         */
/* ===================================================== */

import {
    getProperties
} from "./firebase.js";

let allProperties = [];

const adsContainer =
    document.getElementById("adsContainer");

const loadingMessage =
    document.getElementById("loadingMessage");

const emptyState =
    document.getElementById("emptyState");

const adsCount =
    document.getElementById("adsCount");

const searchInput =
    document.getElementById("searchInput");

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadProperties();

        searchInput.addEventListener(
            "input",
            filterProperties
        );

    }
);

async function loadProperties(){

    try{

        loadingMessage.style.display="block";
        emptyState.style.display="none";
        adsContainer.innerHTML="";

        allProperties =
            await getProperties();

        loadingMessage.style.display="none";

        renderProperties(allProperties);

    }catch(error){

        console.error(error);

        loadingMessage.style.display="none";

        emptyState.style.display="block";

    }

}
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 2                         */
/* ===================================================== */

function renderProperties(properties){

    adsContainer.innerHTML = "";

    adsCount.textContent =
        `${properties.length} Ads`;

    if(properties.length === 0){

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    properties.forEach(property=>{

        const card =
            document.createElement("div");

        card.className = "ad-card";

        const image =
            property.images?.[0] ||
            property.image ||
            "https://via.placeholder.com/600x400?text=No+Image";

        card.innerHTML = `

            <div class="ad-image">

                <img
                src="${image}"
                alt="Property">

            </div>

            <div style="padding:15px;">

                <h3>${property.title || "Untitled Property"}</h3>

                <p style="margin:8px 0;color:#555;">

                    📍 ${property.location || "Unknown Location"}

                </p>

                <h2 style="color:#0057D9;">

                    ₹ ${property.price || "N/A"}

                </h2>

            </div>

        `;

        card.addEventListener("click",()=>{

            window.location.href =
                `details.html?id=${property.id}`;

        });

        adsContainer.appendChild(card);

    });

}
/* ===================================================== */
/*                SELLBY CATEGORY.JS                     */
/*                     JS PART 3                         */
/* ===================================================== */

function filterProperties(){

    const keyword =
        searchInput.value
        .trim()
        .toLowerCase();

    if(keyword === ""){

        renderProperties(allProperties);

        return;

    }

    const filtered =
        allProperties.filter(property=>{

            return (

                (property.title || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (property.location || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (property.type || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (property.description || "")
                .toLowerCase()
                .includes(keyword)

            );

        });

    renderProperties(filtered);

}

console.log("SELLBY Category Page Ready");