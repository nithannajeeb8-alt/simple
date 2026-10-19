/* Early PWA registration for GitHub Pages under /PocketWise/. */
(() => {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const scriptBase = new URL('./', document.currentScript && document.currentScript.src || location.href);
  const workerUrl = new URL('sw.js', scriptBase);
  navigator.serviceWorker.register(workerUrl.href, { scope: scriptBase.pathname })
    .catch(error => console.error('PocketWise service worker registration failed:', error));
})();
