const CACHE_NAME = 'medprotocol-cache';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install event: pre-populate cache, activate immediately.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Fetch event: NETWORK-FIRST. Always try the network for the latest
// version; only fall back to the cached copy if the network request
// fails (offline). This means a new index.html on GitHub is picked up
// on the very next load with no manual cache-version bump required —
// the cache only ever acts as an offline fallback, never as the
// primary source while online.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Activate event: clean up any old-named caches from previous versions
// of this app, then take control of already-open tabs immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});