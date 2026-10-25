/* Service worker - makes the store installable and fast. Prices, stock and orders always come live from Firebase
   (this worker never caches Firebase / Google requests). Pages, scripts and styles use "network first", so new
   uploads show up immediately and the cached copy is only a fallback when the phone is offline. */
const CACHE = 'doe-v1';
const CORE = ['index.html','shop.html','about.html','contact.html','policies.html','style.css','common.js','themes.js','site.js','pwa.js','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // Firebase, Google, fonts: never touched
  if (u.pathname.endsWith('admin.html')) return;        // admin is never cached
  e.respondWith(
    fetch(r).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
