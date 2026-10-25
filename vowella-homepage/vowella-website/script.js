// Cover flow: one slow loop, drag/swipe, click a side card, or use the arrow keys.
(() => {
  const flow = document.querySelector('.flow');
  if (!flow) return;

  const cards = Array.from(flow.querySelectorAll('.flow-card'));
  const count = cards.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AUTOPLAY_MS = 4200;
  const RESUME_MS = 7000;

  let active = Math.floor(count / 2);   // the middle card opens centred
  let timer = null;
  let resumeTimer = null;
  let onScreen = true;
  let hovering = false;
  let held = false;

  // Shortest signed distance from the active card, e.g. -2..2 for five cards.
  const offsetOf = (index) => {
    let o = (((index - active) % count) + count) % count;
    if (o > count / 2) o -= count;
    return o;
  };

  function render() {
    cards.forEach((card, index) => {
      const o = offsetOf(index);
      const previous = card.dataset.o === undefined ? o : Number(card.dataset.o);
      const wrapped = Math.abs(o - previous) > 2;   // card travelling from one end to the other

      if (wrapped) {
        card.style.transition = 'none';
        card.style.opacity = '0';
      }
      card.dataset.o = String(o);
      card.style.setProperty('--o', o);
      card.style.setProperty('--abs', Math.abs(o));
      card.style.zIndex = String(10 - Math.abs(o));
      card.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');

      if (wrapped) {
        void card.offsetWidth;          // commit the jump, then fade the card back in
        card.style.transition = '';
        card.style.opacity = '';
      }
    });
  }

  function goTo(index) {
    active = ((index % count) + count) % count;
    render();
  }

  function play() {
    stop();
    if (reduceMotion.matches) return;
    timer = window.setInterval(() => {
      if (document.hidden || !onScreen || hovering || held) return;
      goTo(active + 1);
    }, AUTOPLAY_MS);
  }
  function stop() { window.clearInterval(timer); timer = null; }

  function pauseThenResume() {
    held = true;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { held = false; }, RESUME_MS);
  }

  // Pointer: drag to move, tap a side card to bring it forward.
  let startX = 0;
  let startY = 0;
  let dragging = false;

  flow.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startX = event.clientX;
    startY = event.clientY;
    dragging = true;
    pauseThenResume();
  });

  flow.addEventListener('pointerup', (event) => {
    if (!dragging) return;
    dragging = false;
    flow.classList.remove('is-dragging');
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goTo(active + (dx < 0 ? 1 : -1));
      return;
    }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
      const card = event.target.closest('.flow-card');
      if (card) goTo(cards.indexOf(card));
    }
  });

  flow.addEventListener('pointermove', (event) => {
    if (dragging && Math.abs(event.clientX - startX) > 8) flow.classList.add('is-dragging');
  });
  flow.addEventListener('pointercancel', () => { dragging = false; flow.classList.remove('is-dragging'); });

  flow.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') hovering = true; });
  flow.addEventListener('pointerleave', () => { hovering = false; });

  flow.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    pauseThenResume();
    goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
  });

  // Only run while the section is in view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; }, { threshold: 0.25 }).observe(flow);
  }

  reduceMotion.addEventListener?.('change', play);

  render();
  play();
})();
