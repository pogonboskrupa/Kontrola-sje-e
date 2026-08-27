const CACHE = 'kp-v5';

// Lokalni fajlovi – MORAJU biti keširani da bi app radio offline.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/screenshot-narrow.png',
  './icons/screenshot-wide.png',
];

// Eksterni resursi – keširaju se best-effort i NE smiju blokirati install.
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      // Ako bilo koji lokalni fajl ne uspije, cijela instalacija mora
      // propasti (svi ovi fajlovi se isporucuju uz app i uvijek su dostupni).
      await c.addAll(CORE_ASSETS);
      // Eksterni CDN resurs kesiramo samo ako je dostupan; ako nema
      // interneta (offline prvi otvor u sumi), instalacija se NE smije
      // srusiti zbog toga – app mora raditi offline i bez PDF biblioteke.
      await Promise.all(CDN_ASSETS.map(url =>
        fetch(url).then(res => {
          if (res.ok) return c.put(url, res);
        }).catch(() => {})
      ));
      return self.skipWaiting();
    })
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
