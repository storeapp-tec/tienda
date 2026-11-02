const CACHE_NAME = 'store-pos-v2';

const ASSETS_LOCALES = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png'
];

// INSTALL: precachear assets locales básicos
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_LOCALES).catch(() => {});
    })
  );
});

// ACTIVATE: limpiar caches viejos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 1. NO interceptar CDNs externos (unpkg, jsdelivr, fonts, Apps Script, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 2. NO interceptar POST (API de Apps Script, aunque ya se filtró arriba)
  if (e.request.method !== 'GET') {
    return;
  }

  // 3. HTML → network-first, fallback a caché
  const accept = e.request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 4. Assets locales → cache-first con fallback a red
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        return res;
      });
    })
  );
});
