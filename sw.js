// Tiene l'app nel telefono: si apre subito e funziona anche senza rete.
// Mostra la copia salvata e intanto scarica quella nuova, che si vedrà alla prossima apertura.
const CACHE = "visite-v19";
const FILE = ["./", "index.html", "manifest.webmanifest", "icona-180.png", "icona-192.png", "icona-512.png", "jspdf.umd.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE.map(f => new Request(f, {cache: "reload"}))))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const salvata = await c.match(e.request, {ignoreSearch: true});
    const nuova = fetch(e.request, {cache: "no-cache"}).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => salvata);
    return salvata || nuova;
  }));
});
