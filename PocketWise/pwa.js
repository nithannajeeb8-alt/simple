/* PocketWise PWA registration. Works when deployed at the repository root or a subpath. */
(() => {
  const status = window.pocketwisePwaStatus = { supported: 'serviceWorker' in navigator, registered: false, error: null };
  if (!status.supported || !/^https?:$/.test(location.protocol)) return;
  const script = document.currentScript;
  const base = new URL('./', script && script.src ? script.src : location.href);
  const worker = new URL('sw.js', base);
  navigator.serviceWorker.register(worker.href, { scope: base.pathname })
    .then(reg => {
      status.registered = true;
      status.scope = reg.scope;
      console.info('PocketWise service worker ready:', reg.scope);
    })
    .catch(error => {
      status.error = String(error && error.message || error);
      console.error('PocketWise service worker registration failed:', error);
    });
  window.addEventListener('beforeinstallprompt', event => {
    window.dispatchEvent(new CustomEvent('pocketwise:install-available', { detail: event }));
  });
})();
