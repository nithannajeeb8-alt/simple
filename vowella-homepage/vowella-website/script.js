// Cover Flow: automatic slow movement, native phone swiping, and respectful pause for interaction.
(() => {
  const gallery = document.querySelector('.coverflow');
  if (!gallery) return;
  const cards = Array.from(gallery.querySelectorAll('.flow-card'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 680px)');
  const roles = ['far-left', 'left', 'mid-left', 'featured', 'mid-right', 'far-right'];
  let currentRoles = cards.map((card) => {
    if (card.classList.contains('flow-card--hero')) return 'featured';
    if (card.classList.contains('flow-card--right')) return 'mid-right';
    if (card.classList.contains('flow-card--far-right')) return 'far-right';
    if (card.classList.contains('flow-card--mid-left')) return 'mid-left';
    if (card.classList.contains('flow-card--left')) return 'left';
    return 'far-left';
  });
  let mobileIndex = Math.max(0, currentRoles.indexOf('featured'));
  let visible = true;
  let interacting = false;
  let resumeTimer;

  function applyRoles() {
    cards.forEach((card, index) => {
      roles.forEach((role) => card.classList.remove('is-' + role));
      card.classList.add('is-' + currentRoles[index]);
    });
  }
  function centerCard(index, behavior = 'smooth') {
    if (!mobile.matches || !cards[index]) return;
    const card = cards[index];
    const target = card.offsetLeft - (gallery.clientWidth - card.offsetWidth) / 2;
    gallery.scrollTo({ left: Math.max(0, target), behavior: reducedMotion.matches ? 'auto' : behavior });
  }
  function pauseAfterInteraction() {
    interacting = true;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { interacting = false; }, 6500);
  }
  function advance() {
    if (reducedMotion.matches || !visible || interacting || document.hidden) return;
    if (mobile.matches) {
      mobileIndex = (mobileIndex + 1) % cards.length;
      centerCard(mobileIndex);
    } else {
      currentRoles = currentRoles.map((_, index) => currentRoles[(index + 1) % currentRoles.length]);
      applyRoles();
    }
  }
  function initializeLayout() {
    if (mobile.matches) {
      mobileIndex = Math.max(0, currentRoles.indexOf('featured'));
      window.requestAnimationFrame(() => centerCard(mobileIndex, 'auto'));
    } else {
      applyRoles();
    }
  }

  initializeLayout();
  window.addEventListener('load', initializeLayout, { once: true });
  gallery.addEventListener('pointerdown', pauseAfterInteraction, { passive: true });
  gallery.addEventListener('touchstart', pauseAfterInteraction, { passive: true });
  gallery.addEventListener('focusin', pauseAfterInteraction);
  gallery.addEventListener('focusout', pauseAfterInteraction);
  gallery.addEventListener('pointerenter', () => { if (!mobile.matches) interacting = true; });
  gallery.addEventListener('pointerleave', () => { interacting = false; });
  gallery.addEventListener('keydown', (event) => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    pauseAfterInteraction();
    mobileIndex = (mobileIndex + (event.key === 'ArrowRight' ? 1 : cards.length - 1)) % cards.length;
    centerCard(mobileIndex);
  });
  gallery.addEventListener('scroll', () => {
    if (!mobile.matches) return;
    const center = gallery.scrollLeft + gallery.clientWidth / 2;
    let best = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (distance < best) { best = distance; mobileIndex = index; }
    });
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    }, { threshold: 0.12 });
    observer.observe(gallery);
  }
  mobile.addEventListener?.('change', initializeLayout);
  reducedMotion.addEventListener?.('change', initializeLayout);
  window.setInterval(advance, 3800);
})();
