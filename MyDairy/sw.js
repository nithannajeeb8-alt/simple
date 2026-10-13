/* Best-effort app-shell cache. User data is stored by the page in IndexedDB, not in this cache. */
const CACHE_NAME = 'quiet-pages-shell-v24-bootstrap-icons-offline';
const BASE = self.registration.scope;
const SHELL = ['./', './index.html', './styles.css', './app.js', './assets/bootstrap-icons.css', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './assets/themes/paper-grain.svg', './assets/themes/rose.svg', './assets/themes/peach.svg', './assets/themes/sand.svg', './assets/themes/ocean.svg', './assets/stickers/flower.svg', './assets/stickers/leaf.svg', './assets/stickers/moon.svg', './assets/stickers/star.svg', './assets/stickers/heart.svg', './assets/stickers/butterfly.svg'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(SHELL.map(async path => {
      try { await cache.add(new Request(new URL(path, BASE), { cache: 'reload' })); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('quiet-pages-shell-') && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Never intercept model, font, icon-CDN, or other third-party requests.
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(new URL('./index.html', BASE), fresh.clone()).catch(() => {});
        return fresh;
      } catch (_) {
        return (await caches.match(new URL('./index.html', BASE))) || (await caches.match(new URL('./', BASE)));
      }
    })());
    return;
  }
  if (url.pathname.endsWith('/app.js') || url.pathname.endsWith('/styles.css')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        if (fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (_) {
        return (await caches.match(request)) || new Response('Offline: this resource is not cached yet.', { status: 503 });
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      return new Response('Offline: this resource is not cached yet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});


self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url ? event.notification.data.url : self.registration.scope;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) { await client.focus(); if ('navigate' in client) await client.navigate(target); return; }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
