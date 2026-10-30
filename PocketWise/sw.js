const CACHE_NAME = 'pocketwise-shell-v2.3.43';
const PADDLE_RUNTIME_CACHE = 'pocketwise-paddle-runtime-v243';
const BASE_URL = self.registration.scope;
const asset = path => new URL(path, BASE_URL).href;
const APP_SHELL = [
  BASE_URL,
  asset('index.html'),
  asset('styles.css'),
  asset('app.js'),
  asset('paddleocr-pwa.js'),
  asset('rupee-ocr.js'),
  asset('receipt-ocr-parser.js'),
  asset('statement-parser.js'),
  asset('local-ai.js'),
  asset('local-ai-worker.js'),
  asset('local-ai-cache-recovery.js'),
  asset('statement-import.js'),
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
  // Cache the official PaddleOCR.js ESM runtime and its jsDelivr dependencies after
  // first use. This lets the already-installed PWA load the runtime offline later.
  // Receipt images are never sent to this cache or to a remote OCR endpoint.
  if (url.origin !== self.location.origin) {
    if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.startsWith('/npm/')) {
      event.respondWith((async () => {
        const cache = await caches.open(PADDLE_RUNTIME_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const response = await fetch(req);
          if (response && response.ok && response.type !== 'opaque') {
            try { await cache.put(req, response.clone()); } catch (_) { /* quota failures keep the network response usable */ }
          }
          return response;
        } catch (error) {
          const fallback = await cache.match(req);
          if (fallback) return fallback;
          throw error;
        }
      })());
    }
    return;
  }
  if (!url.pathname.startsWith(new URL(BASE_URL).pathname)) return;
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
  const title = String(payload.title || 'PocketWise').slice(0, 100);
  const requestedUrl = new URL(String(payload.url || BASE_URL), BASE_URL);
  const scopeUrl = new URL(BASE_URL);
  const safeUrl = requestedUrl.origin === scopeUrl.origin && requestedUrl.pathname.startsWith(scopeUrl.pathname)
    ? requestedUrl.href : BASE_URL;
  const options = {
    body: String(payload.body || 'You have an update in PocketWise.').slice(0, 240),
    icon: asset('assets/icons/icon-192.PNG'),
    badge: asset('assets/icons/icon-192.PNG'),
    tag: String(payload.tag || 'pocketwise-push').slice(0, 100),
    renotify: Boolean(payload.renotify),
    data: { url: safeUrl }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  let target = BASE_URL;
  try {
    const candidate = new URL(event.notification.data && event.notification.data.url || BASE_URL, BASE_URL);
    const scopeUrl = new URL(BASE_URL);
    if (candidate.origin === scopeUrl.origin && candidate.pathname.startsWith(scopeUrl.pathname)) target = candidate.href;
  } catch (_) { target = BASE_URL; }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    for (const client of clients) {
      const current = new URL(client.url);
      const scopeUrl = new URL(BASE_URL);
      if (current.origin === scopeUrl.origin && current.pathname.startsWith(scopeUrl.pathname) && 'focus' in client) return client.focus();
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : undefined;
  }));
});
