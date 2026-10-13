/* Quiet Pages local SVG icon set. Inline, dependency-free icons using a consistent rounded stroke style. */
(() => {
  'use strict';
  const paths = {
    'arrow-clockwise':'<path d="M20 7v5h-5"/><path d="M20 12a8 8 0 1 0 2 5"/>',
    'arrow-left':'<path d="m15 18-6-6 6-6"/><path d="M9 12h12"/>',
    'arrow-up':'<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    'arrow-up-right':'<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    'bell':'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    'bookmark-heart':'<path d="M6 4h12v17l-6-4-6 4z"/><path d="M12 12s-3-1.8-3-3.5A1.8 1.8 0 0 1 12 7.8a1.8 1.8 0 0 1 3 0C15 10.2 12 12 12 12z"/>',
    'box-arrow-in-down-left':'<path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M13 8H5v12h12v-8"/><path d="m8 13 3 3 3-3"/><path d="M11 16V9"/>',
    'box-arrow-up-right':'<path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M17 13v6H5V7h6"/>',
    'calendar3':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    'chat-heart':'<path d="M20 11a7 7 0 0 1-7 7H7l-4 3V10a7 7 0 0 1 7-7h3"/><path d="M16 4s-3-1.8-3-3.5A1.8 1.8 0 0 1 16 0.8a1.8 1.8 0 0 1 3 0C19 3 16 4 16 4z"/>',
    'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    'check2':'<path d="m5 12 4 4L19 6"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'cloud-download':'<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8h-2"/><path d="m9 14 3 3 3-3M12 17V10"/>',
    'cpu':'<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"/>',
    'database-lock':'<ellipse cx="10" cy="5" rx="7" ry="3"/><path d="M3 5v10c0 1.7 3.1 3 7 3"/><path d="M17 8v3M3 10c0 1.7 3.1 3 7 3"/><rect x="13" y="14" width="8" height="7" rx="1.5"/><path d="M15 14v-2a2 2 0 0 1 4 0v2"/>',
    'download':'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
    'eject':'<path d="m12 4 9 12H3z"/><path d="M4 20h16"/>',
    'eraser':'<path d="m7 21 10-10-6-6-8 8a2 2 0 0 0 0 3l5 5h11"/><path d="m14 14 4 4"/>',
    'feather':'<path d="M20 4c-7-2-14 4-14 11 0 3 2 5 5 5 7 0 13-7 11-14z"/><path d="M4 21c4-6 7-8 13-12M8 17l-1-4M12 13l4 1"/>',
    'file-earmark-pdf':'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v6h5M8 17h2a1.5 1.5 0 0 0 0-3H8v6M13 20v-6h1a3 3 0 0 1 0 6zM18 14h-2v6"/>',
    'filetype-html':'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v6h5M9 13l-2 2 2 2M15 13l2 2-2 2M13 12l-1 6"/>',
    'highlighter':'<path d="m4 15 8-8 5 5-8 8H4z"/><path d="m12 7 3-3 5 5-3 3M3 21h18"/>',
    'hourglass-split':'<path d="M5 3h14M5 21h14M7 3c0 5 5 5 5 9s-5 4-5 9M17 3c0 5-5 5-5 9s5 4 5 9"/>',
    'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    'images':'<rect x="7" y="7" width="14" height="14" rx="2"/><path d="M17 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/><circle cx="12" cy="12" r="1.5"/><path d="m21 16-4-4-6 6"/>',
    'info-circle':'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    'journal-bookmark':'<path d="M5 3h13a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 17H3V5a2 2 0 0 1 2-2M14 3v8l-2-1.5L10 11V3"/>',
    'journal-text':'<path d="M5 3h14v18H7a2 2 0 0 1-2-2z"/><path d="M5 17H3V5a2 2 0 0 1 2-2M9 8h6M9 12h6M9 16h4"/>',
    'lock':'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    'palette':'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-3h2a4 4 0 0 0 4-4c0-4-4-7-9-7z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.5" r=".8"/><circle cx="15" cy="7.5" r=".8"/>',
    'palette2':'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-3h2a4 4 0 0 0 4-4c0-4-4-7-9-7z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.5" r=".8"/><circle cx="15" cy="7.5" r=".8"/>',
    'pencil':'<path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/>',
    'plus-lg':'<path d="M12 5v14M5 12h14"/>',
    'question-lg':'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4.5 1.8c-1.3 1.1-2 1.4-2 3M12 17h.01"/>',
    'quote':'<path d="M4 11h6v7H3v-6c0-4 2-6 5-7M14 11h6v7h-7v-6c0-4 2-6 5-7"/>',
    'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    'send':'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    'shield-check':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
    'shield-lock':'<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><rect x="9" y="10" width="6" height="5" rx="1"/><path d="M10 10V8a2 2 0 0 1 4 0v2"/>',
    'sliders':'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
    'sliders2':'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
    'stars':'<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7zM5 2l.6 2.4L8 5l-2.4.6L5 8l-.6-2.4L2 5l2.4-.6z"/>',
    'sticky':'<path d="M5 3h14v12l-5 6H5z"/><path d="M14 21v-6h5M8 8h8M8 12h5"/>',
    'three-dots':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    'trash3':'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    'type-bold':'<path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/>',
    'type-h1':'<path d="M4 5v14M4 12h9M13 5v14M20 8v11M18 10l2-2 2 2"/>',
    'type-h2':'<path d="M4 5v14M4 12h9M13 5v14M17 10a2 2 0 1 1 4 0c0 2-4 3-4 6h5"/>',
    'type-italic':'<path d="M19 4h-9M14 20H5M15 4 9 20"/>',
    'type-underline':'<path d="M6 4v7a6 6 0 0 0 12 0V4M4 21h16"/>',
    'x':'<path d="m6 6 12 12M18 6 6 18"/>',
    'x-lg':'<path d="m6 6 12 12M18 6 6 18"/>'
  };
  const aliases = { 'bi-search':'search', 'bi-sliders2':'sliders2', 'bi-sliders':'sliders', 'bi-stars':'stars', 'bi-calendar3':'calendar3' };
  function iconFor(el) {
    if (!el || el.dataset.localIcon === '1') return;
    const cls = [...el.classList].find(c => c.startsWith('bi-') && c !== 'bi');
    if (!cls) return;
    const name = aliases[cls] || cls.slice(3);
    const drawing = paths[name] || '<path d="M12 3 14 9l6 3-6 2-2 7-2-7-6-2 6-3z"/>';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '1em'); svg.setAttribute('height', '1em');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '1.8'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('qp-icon-svg');
    svg.innerHTML = drawing;
    el.replaceWith(svg);
  }
  function scan(root) {
    if (root.nodeType === 1 && root.matches?.('i.bi')) iconFor(root);
    root.querySelectorAll?.('i.bi').forEach(iconFor);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document), { once: true }); else scan(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => { if (node.nodeType === 1) scan(node); }))).observe(document.documentElement, { childList: true, subtree: true });
})();
