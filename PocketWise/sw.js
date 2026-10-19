const CACHE_NAME = 'pocketwise-shell-v2.0.9';
const BASE_URL = self.registration.scope;
const asset = path => new URL(path, BASE_URL).href;
const APP_SHELL = [
  BASE_URL,
  asset('index.html'),
  asset('styles.css'),
  asset('app.js'),
  asset('onboarding.js'),
  asset('pwa.js'),
  asset('manifest.webmanifest'),
  asset('assets/icons/icon.svg'),
  asset('assets/icons/icon-192.PNG'),
  asset('assets/icons/icon-512.PNG')
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('pocketwise-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(BASE_URL).pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE_NAME).then(cache => cache.put(asset('index.html'), res.clone()));
      return res;
    }).catch(() => caches.match(req).then(res => res || caches.match(asset('index.html')))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => {
    if (cached) return cached;
    return fetch(req).then(res => {
      if (res && res.ok) caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
      return res;
    }).catch(() => {
      if (req.destination === 'image') return caches.match(asset('assets/icons/icon.svg'));
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    });
  }));
});
