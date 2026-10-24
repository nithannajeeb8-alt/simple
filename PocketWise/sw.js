const CACHE_NAME = 'pocketwise-shell-v2.3.11';
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


// Push messages are delivered by a configured Web Push sender, including when the page is closed.
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { body: event.data ? event.data.text() : '' }; }
  const title = String(payload.title || 'PocketWise');
  const options = {
    body: String(payload.body || 'You have an update in PocketWise.'),
    icon: asset('assets/icons/icon-192.PNG'),
    badge: asset('assets/icons/icon-192.PNG'),
    tag: String(payload.tag || 'pocketwise-push'),
    renotify: Boolean(payload.renotify),
    data: { url: payload.url || BASE_URL }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url || BASE_URL, BASE_URL).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    for (const client of clients) {
      if (client.url.startsWith(BASE_URL) && 'focus' in client) return client.focus();
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
  }));
});
