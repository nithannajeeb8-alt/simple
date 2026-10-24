(() => {
  const root = document.documentElement;
  root.classList.add('js-motion');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('load', () => {
    window.setTimeout(() => document.body.classList.add('is-ready'), prefersReducedMotion ? 0 : 80);
  }, { once: true });

  // Reveal long-form sections only when they enter the viewport.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Small-screen navigation keeps the visual header simple until it is needed.
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      nav.classList.toggle('is-open', !isOpen);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        menuToggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        menuToggle.focus();
      }
    });
  }

  // Cover flow: the central position is the focused design. Only S1 is live.
  const stage = document.querySelector('#coverflow');
  if (stage) {
    const cards = Array.from(stage.querySelectorAll('[data-slide]'));
    const dots = Array.from(document.querySelectorAll('.flow-dot'));
    const prev = document.querySelector('.flow-previous');
    const next = document.querySelector('.flow-next');
    const status = document.querySelector('#flow-status');
    const captions = [
      'Design 02 · In the atelier, not available yet.',
      'Invitation 01 of 03 · The only live design, for now.',
      'Design 03 · In the atelier, not available yet.'
    ];
    let active = 1;

    const render = () => {
      cards.forEach((card, index) => {
        const offset = index - active;
        const magnitude = Math.abs(offset);
        const distance = Math.min(window.innerWidth * (window.innerWidth <= 720 ? 0.61 : 0.36), window.innerWidth <= 720 ? 290 : 440);
        const x = offset * distance;
        const scale = magnitude === 0 ? 1 : magnitude === 1 ? (window.innerWidth <= 720 ? 0.78 : 0.82) : 0.62;
        const rotate = offset * -13;
        card.dataset.offset = String(offset);
        card.style.transform = `translate3d(calc(-50% + ${x}px), ${magnitude === 0 ? 0 : 12}px, 0) scale(${scale}) rotateY(${rotate}deg)`;
        card.style.zIndex = String(10 - magnitude);
        card.setAttribute('aria-hidden', String(magnitude !== 0));
        card.style.pointerEvents = magnitude === 0 ? 'auto' : 'none';
      });
      dots.forEach((dot, index) => {
        const selected = index === active;
        dot.classList.toggle('is-active', selected);
        if (selected) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (prev) prev.disabled = active === 0;
      if (next) next.disabled = active === cards.length - 1;
      if (status) status.textContent = captions[active];
    };
    const move = (delta) => {
      active = Math.max(0, Math.min(cards.length - 1, active + delta));
      render();
    };
    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => {
      active = index;
      render();
    }));
    window.addEventListener('resize', render, { passive: true });
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    });
    render();
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
