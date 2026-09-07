const CACHE = 'kp-v9';

// Koliko čekati mrežu pri otvaranju app-a prije nego se posluži keš.
// Kratko, da na slabom signalu (teren) app ne "visi".
const NAV_TIMEOUT = 3000;

// OSNOVNO = bez ovoga se app ne može otvoriti offline. Malo i brzo,
// da app postane upotrebljiv offline za par sekundi.
const OSNOVNO = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
];

// DODATNO = korisno, ali ne smije blokirati. Preuzima se u pozadini i
// svaki fajl zasebno, da jedan neuspjeh (slab signal) ne obori sve
// ostalo – to je bio uzrok "vječne pripreme" kad je lista bila velika
// i išla kroz jedan sve-ili-ništa addAll().
const DODATNO = [
  './vendor/jspdf.umd.min.js',
  './icons/icon.svg',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-apple-180.png',
  './icons/screenshot-narrow.png',
  './icons/screenshot-wide.png',
];

// Kešira listu fajlo po fajl; vraća koliko ih nije uspjelo.
async function kesirajPojedinacno(lista) {
  const c = await caches.open(CACHE);
  const r = await Promise.allSettled(lista.map(async u => {
    if (await c.match(u)) return 'vec';   // već imamo, ne skidaj ponovo
    return c.add(u);
  }));
  return r.filter(x => x.status === 'rejected').length;
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(OSNOVNO))      // app shell – mora uspjeti
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    // Ostatak skidamo tek nakon preuzimanja kontrole, pa app radi
    // offline i dok se ovo još preuzima u pozadini.
    await kesirajPojedinacno(DODATNO);
  })());
});

// Stranica može zatražiti da se dopuni ono što ranije nije uspjelo
// (npr. kad se korisnik vrati u doseg signala).
self.addEventListener('message', e => {
  if (e.data && e.data.tip === 'dopuni') {
    e.waitUntil(kesirajPojedinacno(DODATNO).then(neuspjelo => {
      if (e.source) e.source.postMessage({ tip: 'dopunjeno', neuspjelo });
    }));
  }
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
