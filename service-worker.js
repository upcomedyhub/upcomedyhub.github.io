const CACHE_NAME = "upcomedyhub-v2";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/IMG_20260917_172912.jpg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const request = event.request;

  // HTML / page navigation requests: ALWAYS try the network first,
  // so every visitor gets the latest deployed version. Only fall
  // back to the cached copy if there's no internet connection.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then(function (networkResponse) {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(function () {
          return caches.match(request).then(function (cachedResponse) {
            return cachedResponse || caches.match("/index.html");
          });
        })
    );
    return;
  }

  // Everything else (images, manifest, etc.): cache-first is fine,
  // these don't change often and this keeps the site fast/offline-ready.
  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      return cachedResponse || fetch(request);
    })
  );
});
