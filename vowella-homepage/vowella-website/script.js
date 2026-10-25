// Vowella Cover Flow: balanced desktop fan, native touch scrolling on mobile, keyboard support and reduced-motion respect.
(() => {
  const gallery = document.querySelector('.coverflow');
  if (!gallery) return;

  const cards = Array.from(gallery.querySelectorAll('.flow-card'));
  if (!cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 680px)');
  const roles = ['far-left', 'left', 'featured', 'right', 'far-right'];
  const stateClasses = ['is-active', 'is-prev', 'is-next', 'is-prev-2', 'is-next-2'];

  let cardRoles = cards.map((card) => {
    if (card.classList.contains('flow-card--hero')) return 'featured';
    if (card.classList.contains('flow-card--right')) return 'right';
    if (card.classList.contains('flow-card--far-right')) return 'far-right';
    if (card.classList.contains('flow-card--left')) return 'left';
    return 'far-left';
  });

  cards.forEach((card) => {
    ['hero', 'far-left', 'left', 'mid-left', 'right', 'far-right'].forEach((role) => card.classList.remove(`flow-card--${role}`));
  });

  let mobileIndex = Math.max(0, cardRoles.indexOf('featured'));
  let galleryVisible = true;
  let interacting = false;
  let resumeTimer = 0;
  let depthFrame = 0;

  function updateAnnouncement() {
    const active = cards[mobileIndex];
    if (!active) return;
    gallery.setAttribute('aria-label', `Vowella invitation previews. Preview ${mobileIndex + 1} of ${cards.length}. Use the left and right arrow keys or swipe to explore.`);
    cards.forEach((card, index) => {
      if (index === mobileIndex) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
  }

  function applyDesktopRoles() {
    cards.forEach((card, index) => {
      roles.forEach((role) => card.classList.remove(`is-${role}`));
      card.classList.add(`is-${cardRoles[index]}`);
    });
    mobileIndex = Math.max(0, cardRoles.indexOf('featured'));
    updateAnnouncement();
  }

  function centerCard(index, behavior = 'smooth') {
    const card = cards[index];
    if (!mobile.matches || !card) return;
    const galleryRect = gallery.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const galleryCenter = galleryRect.left + gallery.clientWidth / 2;
    const target = gallery.scrollLeft + cardCenter - galleryCenter;
    const maxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    gallery.scrollTo({
      left: Math.min(maxScroll, Math.max(0, target)),
      behavior: reducedMotion.matches ? 'auto' : behavior
    });
  }

  function updateMobileDepth() {
    depthFrame = 0;
    if (!mobile.matches) return;

    const bounds = gallery.getBoundingClientRect();
    const center = bounds.left + gallery.clientWidth / 2;
    const positions = cards.map((card, index) => {
      const rect = card.getBoundingClientRect();
      return { index, center: rect.left + rect.width / 2 };
    });
    const active = positions.reduce((best, item) =>
      Math.abs(item.center - center) < Math.abs(best.center - center) ? item : best
    );
    mobileIndex = active.index;

    const before = positions.filter((item) => item.center < active.center).sort((a, b) => b.center - a.center);
    const after = positions.filter((item) => item.center > active.center).sort((a, b) => a.center - b.center);

    cards.forEach((card) => stateClasses.forEach((name) => card.classList.remove(name)));
    cards[mobileIndex].classList.add('is-active');
    before.forEach((item, order) => cards[item.index].classList.add(order === 0 ? 'is-prev' : 'is-prev-2'));
    after.forEach((item, order) => cards[item.index].classList.add(order === 0 ? 'is-next' : 'is-next-2'));
    updateAnnouncement();
  }

  function scheduleMobileDepth() {
    if (!depthFrame) depthFrame = window.requestAnimationFrame(updateMobileDepth);
  }

  function pauseAfterInteraction() {
    interacting = true;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { interacting = false; }, 6500);
  }

  function advanceDesktop() {
    if (reducedMotion.matches || !galleryVisible || interacting || document.hidden || mobile.matches) return;
    cardRoles = cardRoles.map((_, index) => cardRoles[(index + cardRoles.length - 1) % cardRoles.length]);
    applyDesktopRoles();
  }

  function initializeLayout() {
    if (mobile.matches) {
      mobileIndex = Math.max(0, cardRoles.indexOf('featured'));
      window.requestAnimationFrame(() => {
        centerCard(mobileIndex, 'auto');
        scheduleMobileDepth();
      });
    } else {
      applyDesktopRoles();
    }
  }

  gallery.addEventListener('pointerdown', pauseAfterInteraction, { passive: true });
  gallery.addEventListener('touchstart', pauseAfterInteraction, { passive: true });
  gallery.addEventListener('focusin', pauseAfterInteraction);
  gallery.addEventListener('pointerenter', () => { if (!mobile.matches) interacting = true; });
  gallery.addEventListener('pointerleave', () => { interacting = false; });
  gallery.addEventListener('scroll', scheduleMobileDepth, { passive: true });

  gallery.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    pauseAfterInteraction();
    const direction = event.key === 'ArrowRight' ? 1 : -1;

    if (mobile.matches) {
      mobileIndex = (mobileIndex + direction + cards.length) % cards.length;
      centerCard(mobileIndex);
      return;
    }

    cardRoles = direction > 0
      ? cardRoles.map((_, index) => cardRoles[(index + cardRoles.length - 1) % cardRoles.length])
      : cardRoles.map((_, index) => cardRoles[(index + 1) % cardRoles.length]);
    applyDesktopRoles();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      galleryVisible = entries.some((entry) => entry.isIntersecting);
    }, { threshold: 0.12 });
    observer.observe(gallery);
  }

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleMobileDepth);
    observer.observe(gallery);
  }

  window.addEventListener('resize', initializeLayout, { passive: true });
  window.addEventListener('load', initializeLayout, { once: true });
  if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', initializeLayout);
  else if (typeof mobile.addListener === 'function') mobile.addListener(initializeLayout);
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', initializeLayout);
  else if (typeof reducedMotion.addListener === 'function') reducedMotion.addListener(initializeLayout);
  document.addEventListener('visibilitychange', () => { if (document.hidden) interacting = true; });

  initializeLayout();
  window.setInterval(advanceDesktop, 7200);
})();
