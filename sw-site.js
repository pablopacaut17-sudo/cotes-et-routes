/* Cotes & Routes – service worker du site : installation sur l'écran d'accueil et consultation hors connexion */
const V = 'cr-site-v1', DATA = 'cr-data-v1', EXT = 'cr-ext-v1';
const BASE = ['./', 'index.html', 'manifest.webmanifest', 'icones/icon-192.png', 'design/site-v2.css', 'design/site-v2.js', 'design/site-v3.css', 'design/site-v3.js', 'design/site-v4.css', 'design/site-v4.js', 'design/site-v5.css', 'design/site-v5.js', 'design/lexique.txt', 'design/site-v6.css', 'design/site-v6.js', 'design/site-v7.css', 'design/site-v7.js', 'design/site-v8.js'];
const DONNEES = ['data/airports.json', 'data/counter.json', 'data/fleet.json', 'data/routes.json', 'data/wikidata.json', 'data/eurostat.json', 'data/fleetage.json', 'data/osm-airports.json', 'data/types-all.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => {})))).then(() => caches.open(DATA)).then(c => Promise.all(DONNEES.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => ![V, DATA, EXT].includes(n)).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
const reseauDabord = (req, cache, repli) => fetch(req).then(r => { if (r && r.ok) { const c = r.clone(); caches.open(cache).then(x => x.put(req, c)); } return r; }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (repli ? caches.match(repli) : Response.error())));
const cacheDabord = (req, cache) => caches.match(req).then(r => r || fetch(req).then(n => { if (n && (n.ok || n.type === 'opaque')) { const c = n.clone(); caches.open(cache).then(x => x.put(req, c)); } return n; }));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    if (u.pathname.includes('/spotting/') || u.pathname.endsWith('.gz')) return;
    if (req.mode === 'navigate') return e.respondWith(reseauDabord(req, V, 'index.html'));
    if (u.pathname.includes('/data/')) return e.respondWith(reseauDabord(req, DATA));
    return e.respondWith(reseauDabord(req, V));
  }
  if (/cdn\.jsdelivr\.net|unpkg\.com|fonts\.(googleapis|gstatic)\.com|upload\.wikimedia\.org/.test(u.hostname)) return e.respondWith(cacheDabord(req, EXT));
});
