const CACHE_NAME = "little-days-shell-v10";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=10",
  "./app.js?v=10",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/brand-mark.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("little-days-shell-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation is network-first so a new deployment replaces stale HTML; app assets
  // are versioned and cache-first so the installed app remains useful offline.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put("./index.html", response.clone()));
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html"))));
    return;
  }

  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});


self.addEventListener("notificationclick", event => {
  const data = event.notification?.data || {};
  const action = event.action;
  const outcomeId = data.outcomeId || event.notification?.tag || "";
  event.notification.close();
  event.waitUntil((async () => {
    let target = new URL(data.url || "./", self.registration.scope);
    if (outcomeId && outcomeId.includes("|")) {
      target.searchParams.set("routineCheckin", outcomeId);
      if (action === "done") target.searchParams.set("routineStatus", "completed");
      else if (action === "missed") target.searchParams.set("routineStatus", "missed");
    }
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if ("focus" in client) { await client.navigate(target.href); return client.focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target.href);
  })());
});
