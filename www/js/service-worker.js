/* ===================================================== */
/*             SELLBY SERVICE-WORKER.JS                  */
/*                     PART 1                            */
/* ===================================================== */
/*
    File Name : service-worker.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 1
    Contains  :
    ✔ Cache Name
    ✔ Core Files
    ✔ Install Event
*/
/* ===================================================== */

const CACHE_NAME =

    "sellby-v1.0.0";

const CORE_FILES = [

    "/",

    "/index.html",

    "/manifest.json",

    "/css/style.css",

    "/js/firebase-config.js",

    "/icons/icon-192.png",

    "/icons/icon-512.png",

    "/offline.html"

];

self.addEventListener(

    "install",

    (event) => {

        event.waitUntil(

            caches.open(

                CACHE_NAME

            ).then(

                (cache) =>

                    cache.addAll(

                        CORE_FILES

                    )

            )

        );

        self.skipWaiting();

    }

);
/* ===================================================== */
/*             SELLBY SERVICE-WORKER.JS                  */
/*                     PART 2                            */
/* ===================================================== */
/*
    File Name : service-worker.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 2
    Contains  :
    ✔ Activate Event
    ✔ Remove Old Cache
    ✔ Fetch Event
*/
/* ===================================================== */

self.addEventListener(

    "activate",

    (event) => {

        event.waitUntil(

            caches.keys().then(

                (keys) =>

                    Promise.all(

                        keys.map((key) => {

                            if (

                                key !==

                                CACHE_NAME

                            ) {

                                return caches.delete(

                                    key

                                );

                            }

                        })

                    )

            )

        );

        self.clients.claim();

    }

);

self.addEventListener(

    "fetch",

    (event) => {

        event.respondWith(

            caches.match(

                event.request

            ).then(

                (cached) => {

                    return (

                        cached ||

                        fetch(

                            event.request

                        )

                    );

                }

            )

        );

    }

);
/* ===================================================== */
/*             SELLBY SERVICE-WORKER.JS                  */
/*                     PART 3                            */
/* ===================================================== */
/*
    File Name : service-worker.js
    Project   : SELLBY
    Mission   : Sell Easy. Buy Easy.
    Part      : 3
    Contains  :
    ✔ Message Event
    ✔ Offline Fallback
    ✔ Service Worker Ready
*/
/* ===================================================== */

self.addEventListener(

    "message",

    (event) => {

        if (

            event.data &&

            event.data.type ===

            "SKIP_WAITING"

        ) {

            self.skipWaiting();

        }

    }

);

self.addEventListener(

    "fetch",

    (event) => {

        if (

            event.request.mode ===

            "navigate"

        ) {

            event.respondWith(

                fetch(

                    event.request

                ).catch(() =>

                    caches.match(

                        "/offline.html"

                    )

                )

            );

        }

    }

);

console.log(

    "SELLBY Service Worker Ready"

);