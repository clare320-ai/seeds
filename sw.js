// 菜籽仔：離線外殼快取。一律先連網拿最新版（略過瀏覽器的 HTTP 快取），沒網路才用快取。
const CACHE = 'yaya-v16';
const SHELL = ['./', './index.html', './places-hsinchu.js', './places-taichung.js','./manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache:'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(url.href, {cache:'no-cache'}).then(r => {
      if(r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
