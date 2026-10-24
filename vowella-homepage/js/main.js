/* Vowella — behaviour. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var templates = window.VOWELLA_TEMPLATES || [];

  /* ---------- helpers ---------- */
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- hero entrance ---------- */
  function playHero() {
    if (root.classList.contains('is-playing')) return;
    root.classList.add('is-playing');
  }
  (function initHero() {
    var imgs = document.querySelectorAll('.opening__bg img, .hero__couple img');
    var pending = imgs.length;
    var started = false;
    function go() { if (!started) { started = true; playHero(); } }
    function done() { if (--pending <= 0) go(); }
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.complete && img.naturalWidth) return done();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
    if (pending <= 0) go();
    setTimeout(go, 2500); // never make the visitor wait on a slow image
  })();

  /* ---------- header: transparent over the opening, solid afterwards ---------- */
  var header = document.querySelector('.site-header');
  var collection = document.getElementById('collection');
  var hero = document.querySelector('.hero');
  var couple = document.querySelector('.hero__couple');
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    if (collection) {
      header.classList.toggle('is-solid', collection.getBoundingClientRect().top <= 160);
    }
    if (couple && hero && !reduceMotion.matches) {
      var h = hero.offsetHeight;
      if (y < h) couple.style.setProperty('--par', Math.round(y * 0.1) + 'px');
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- scroll reveals ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveals, function (n) { io.observe(n); });
  } else {
    Array.prototype.forEach.call(reveals, function (n) { n.classList.add('is-in'); });
  }

  /* ---------- gallery ---------- */
  var gallery = document.getElementById('gallery');

  function posterFor(t) {
    var parts = (t.sample || '').split('&');
    var poster = el('div', { class: 'device__poster', 'aria-hidden': 'true' });
    poster.appendChild(el('small', { text: 'The wedding of' }));
    poster.appendChild(el('b', { html: (parts[0] || '').trim() + '<i>&amp;</i>' + (parts[1] || '').trim() }));
    return poster;
  }

  function buildTemplate(t, index) {
    var art = el('article', { class: 'tpl reveal', 'aria-labelledby': 'tpl-' + t.id });

    /* media */
    var media = el('div', { class: 'tpl__media' });
    media.appendChild(el('span', { class: 'tpl__code', text: t.code }));
    var spray = el('img', { class: 'tpl__spray', src: 'assets/sprays.webp', alt: '', width: '1100', height: '760', loading: 'lazy', decoding: 'async' });
    media.appendChild(spray);

    var device = el('a', { class: 'device', href: t.url, target: '_blank', rel: 'noopener', 'aria-label': 'Open the ' + t.name + ' invitation (new tab)' });
    var screen = el('div', { class: 'device__screen' });
    screen.appendChild(posterFor(t));
    var frame = el('iframe', { class: 'device__frame', title: t.name + ' live preview', tabindex: '-1', 'aria-hidden': 'true', loading: 'lazy', 'data-src': t.url });
    screen.appendChild(frame);
    device.appendChild(screen);
    media.appendChild(device);

    /* body */
    var body = el('div', { class: 'tpl__body' });
    body.appendChild(el('p', { class: 'tpl__no', text: 'No. ' + pad(index + 1) }));
    body.appendChild(el('h3', { class: 'tpl__name', id: 'tpl-' + t.id, text: t.name }));
    if (t.sample) body.appendChild(el('p', { class: 'tpl__sample', text: 'Sample: ' + t.sample }));
    body.appendChild(el('p', { class: 'tpl__tagline', text: t.tagline }));
    body.appendChild(el('p', { class: 'tpl__desc', text: t.description }));
    var feats = el('ul', { class: 'tpl__features', 'aria-label': 'Features' });
    (t.features || []).forEach(function (f) { feats.appendChild(el('li', { text: f })); });
    body.appendChild(feats);

    var actions = el('div', { class: 'tpl__actions' });
    var prev = el('button', { class: 'btn btn--solid', type: 'button', 'data-preview': t.id, text: 'Preview' });
    prev.setAttribute('aria-haspopup', 'dialog');
    var open = el('a', { class: 'btn btn--ghost', href: t.url, target: '_blank', rel: 'noopener', text: 'Open invitation ↗' });
    actions.appendChild(prev);
    actions.appendChild(open);
    body.appendChild(actions);

    art.appendChild(media);
    art.appendChild(body);
    return art;
  }

  function scaleDevice(device) {
    var screen = device.querySelector('.device__screen');
    var frame = device.querySelector('.device__frame');
    if (!screen || !frame) return;
    frame.style.setProperty('--s', (screen.clientWidth / 390).toFixed(4));
  }

  function loadFrame(frame) {
    if (!frame || frame.getAttribute('src')) return;
    var url = frame.getAttribute('data-src');
    function attach() {
      frame.addEventListener('load', function () { frame.classList.add('is-ready'); }, { once: true });
      frame.setAttribute('src', url);
    }
    // Only swap the poster for the live page when the page is actually reachable.
    if (window.fetch) {
      fetch(url, { mode: 'no-cors', cache: 'force-cache' }).then(attach, function () { /* keep poster */ });
    } else { attach(); }
  }

  if (gallery) {
    templates.forEach(function (t, i) { gallery.appendChild(buildTemplate(t, i)); });
    gallery.appendChild(el('div', { class: 'tpl-next' }, [
      el('p', { text: 'Volume two is in the studio.' }),
      el('p', { text: 'More designs, in time' })
    ]));

    // newly inserted reveal blocks
    var newReveals = gallery.querySelectorAll('.reveal');
    Array.prototype.forEach.call(newReveals, function (n) {
      if ('IntersectionObserver' in window) io.observe(n); else n.classList.add('is-in');
    });

    var devices = gallery.querySelectorAll('.device');
    function scaleAll() { Array.prototype.forEach.call(devices, scaleDevice); }
    scaleAll();
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(scaleAll);
      Array.prototype.forEach.call(devices, function (d) { ro.observe(d); });
    } else {
      window.addEventListener('resize', scaleAll);
    }

    // load the live preview only when it approaches the viewport
    var frames = gallery.querySelectorAll('.device__frame');
    if ('IntersectionObserver' in window) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { loadFrame(e.target); fio.unobserve(e.target); }
        });
      }, { rootMargin: '300px 0px' });
      Array.prototype.forEach.call(frames, function (f) { fio.observe(f); });
    } else {
      Array.prototype.forEach.call(frames, loadFrame);
    }
  }

  /* ---------- preview dialog ---------- */
  var dlg = document.getElementById('preview');
  var dlgFrame = document.getElementById('preview-frame');
  var dlgTitle = document.getElementById('preview-title');
  var dlgOpen = document.getElementById('preview-open');
  var lastTrigger = null;

  function openPreview(id, trigger) {
    var t = templates.filter(function (x) { return x.id === id; })[0];
    if (!t || !dlg) return;
    if (typeof dlg.showModal !== 'function') { window.open(t.url, '_blank', 'noopener'); return; }
    lastTrigger = trigger || null;
    dlgTitle.textContent = t.name + ' · ' + t.code;
    dlgOpen.href = t.url;
    dlgFrame.src = t.url;
    dlg.showModal();
    document.getElementById('preview-close').focus();
  }
  function closePreview() { if (dlg && dlg.open) dlg.close(); }

  if (dlg) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-preview]');
      if (b) openPreview(b.getAttribute('data-preview'), b);
    });
    document.getElementById('preview-close').addEventListener('click', closePreview);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closePreview(); });
    dlg.addEventListener('close', function () {
      dlgFrame.removeAttribute('src'); // stop any audio/timers in the invitation
      if (lastTrigger) lastTrigger.focus();
    });
  }
})();
