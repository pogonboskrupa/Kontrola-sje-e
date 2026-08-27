const CACHE = 'kp-v6';

// Svi fajlovi se isporučuju uz app (nema više eksternog CDN-a) – moraju
// se uspješno keširati da bi app radio 100% offline, od prvog otvaranja.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/screenshot-narrow.png',
  './icons/screenshot-wide.png',
  './vendor/jspdf.umd.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => {
      if (e.request.mode === 'navigate') return caches.match('./index.html');
      return new Response('', { status: 504, statusText: 'Offline' });
    }))
  );
});
