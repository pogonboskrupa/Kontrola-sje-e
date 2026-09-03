const CACHE = 'kp-v8';

// Koliko čekati mrežu pri otvaranju app-a prije nego se posluži keš.
// Kratko, da na slabom signalu (teren) app ne "visi".
const NAV_TIMEOUT = 3000;

// Svi fajlovi se isporučuju uz app (nema više eksternog CDN-a) – moraju
// se uspješno keširati da bi app radio 100% offline, od prvog otvaranja.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-apple-180.png',
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

function mrezaSaTimeoutom(request, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(request).then(
      res => { clearTimeout(t); resolve(res); },
      err => { clearTimeout(t); reject(err); }
    );
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;

  // Otvaranje aplikacije: prvo mreža (da se nova verzija pokupi sama, bez
  // ručnog podizanja verzije keša), pa keš ako mreže nema ili je preslaba.
  if (req.mode === 'navigate') {
    e.respondWith(
      mrezaSaTimeoutom(req, NAV_TIMEOUT).then(res => {
        const zaUrl   = res.clone();
        const zaIndex = res.clone();
        caches.open(CACHE).then(c => {
          c.put(req.url, zaUrl);
          c.put('./index.html', zaIndex);
        });
        return res;
      }).catch(() =>
        caches.match(req).then(r => r || caches.match('./index.html'))
      )
    );
    return;
  }

  // Ostali resursi: prvo keš (brzo i radi offline), pa mreža.
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(req, clone));
      return res;
    }).catch(() => new Response('', { status: 504, statusText: 'Offline' })))
  );
});
