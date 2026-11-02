const CACHE_NAME = 'store-pos-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Las llamadas a Google Apps Script siempre van a internet en vivo
  if (e.request.url.includes('script.google.com')) {
    return;
  }
});
