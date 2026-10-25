// Vowella's upcoming-design gallery is a visual concept, never a set of product links.
// Desktop keeps the layered fan. On phones, center the featured design in a native
// horizontal scroller so its neighboring previews are visibly discoverable.
(() => {
  const coverflow = document.querySelector('.coverflow');
  if (!coverflow) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) document.documentElement.classList.add('reduce-motion');

  const mobile = window.matchMedia('(max-width: 680px)');
  const centerFeaturedCard = () => {
    if (!mobile.matches) return;
    const featured = coverflow.querySelector('.flow-card--hero');
    if (!featured) return;
    const target = featured.offsetLeft + featured.offsetWidth / 2 - coverflow.clientWidth / 2;
    coverflow.scrollLeft = Math.max(0, target);
  };

  // Wait until layout is measurable, then center the red invitation on narrow screens.
  if (document.readyState === 'complete') centerFeaturedCard();
  else window.addEventListener('load', centerFeaturedCard, { once: true });
  mobile.addEventListener?.('change', centerFeaturedCard);
})();
