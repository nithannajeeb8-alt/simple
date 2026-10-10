'use strict';

/* PageBloom PDF Studio
   Zero-dependency client-side app. Images never leave the browser.
   The PDF writer embeds canvas-rendered JPEGs into a standards-based PDF 1.4 file.
*/

const ICONS = {
  'file-stack': '<rect x="5" y="3" width="12" height="15" rx="2"/><path d="M8 7h6M8 10h6M8 13h3"/><path d="M7 21h10a2 2 0 0 0 2-2V6"/>',
  images: '<rect x="3" y="4" width="15" height="16" rx="2"/><path d="m3 15 4-4 4 4 2-2 5 5"/><circle cx="8.5" cy="9" r="1.5"/><path d="M8 2h11a2 2 0 0 1 2 2v13"/>',
  camera: '<path d="M14 5h-4l-2 2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9zM5 3l.7 1.8L7.5 5.5l-1.8.7L5 8l-.7-1.8-1.8-.7 1.8-.7z"/>',
  'shield-check': '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/><path d="m9 12 2 2 4-4"/>',
  'trash-2': '<path d="M3 6h18M8 6V4h8v2m-11 0 1 14h10l1-14M10 10v6M14 10v6"/>',
  'sliders-horizontal': '<path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  'rectangle-vertical': '<rect x="6" y="2.5" width="12" height="19" rx="2"/>',
  'rectangle-horizontal': '<rect x="2.5" y="6" width="19" height="12" rx="2"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'arrow-right': '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  'lock-keyhole': '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  x: '<path d="m18 6-12 12M6 6l12 12"/>',
  'rotate-cw': '<path d="M20 7v5h-5"/><path d="M20 12a8 8 0 1 1-2.34-5.66L20 9"/>',
  'rotate-ccw': '<path d="M4 7v5h5"/><path d="M4 12a8 8 0 1 0 2.34-5.66L4 9"/>',
  'grip-vertical': '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
  'file-pen': '<path d="M12 20H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l6 6v2"/><path d="M13 3v6h6M8 13h4M8 17h3"/><path d="m16 19 4-4 2 2-4 4-3 1z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  'arrow-up-down': '<path d="m7 15-4-4 4-4M3 11h12M17 9l4 4-4 4m4-4H9"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'circle-check': '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
  'external-link': '<path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'file-check': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6m-12 5 2 2 4-4"/>',
};

function iconSvg(name, extraClass = '') {
  const paths = ICONS[name] || ICONS.info;
  return `<svg viewBox="0 0 24 24" aria-hidden="true"${extraClass ? ` class="${extraClass}"` : ''}>${paths}</svg>`;
}
function installIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((node) => {
    const name = node.getAttribute('data-icon');
    node.innerHTML = iconSvg(name);
  });
}

const state = {
  pages: [],
  selectedId: null,
  orientation: 'portrait',
  paperSize: 'A4',
  margin: 8,
  fit: 'contain',
  quality: 90,
  pageNumbers: false,
  fileName: 'my-document',
  busy: false,
  currentPdfBlob: null,
  currentPdfUrl: null,
  draggedId: null,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const ui = {
  fileInput: $('#file-input'), cameraInput: $('#camera-input'), dropzone: $('#dropzone'),
  pageGrid: $('#page-grid'), emptyState: $('#empty-state'), pagesCount: $('#pages-count'),
  headingCount: $('#heading-count'), sidebarCount: $('#sidebar-count'), exportButton: $('#export-button'),
  inspectorExport: $('#inspector-export'), previewButton: $('#preview-button'), modalBackdrop: $('#modal-backdrop'),
  modalBody: $('#modal-body'), modalTitle: $('#modal-title'), modalKicker: $('#modal-kicker'),
  modalDownload: $('#modal-download'), modalFooterNote: $('#modal-footer-note'), modalClose: $('#modal-close'),
  paperSize: $('#paper-size'), marginRange: $('#margin-range'), marginValue: $('#margin-value'),
  qualityRange: $('#quality-range'), qualityValue: $('#quality-value'), fileName: $('#file-name'),
  pageNumbers: $('#page-numbers'), toastRegion: $('#toast-region'),
};

function makeId() {
  return (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast${type === 'error' ? ' error' : ''}`;
  toast.innerHTML = `${iconSvg(type === 'error' ? 'info' : 'check-circle')}<span></span>`;
  toast.querySelector('span').textContent = message;
  ui.toastRegion.appendChild(toast);
  window.setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateY(5px)';
    window.setTimeout(() => toast.remove(), 220);
  }, 3600);
}
function openFilePicker(input = ui.fileInput) {
  if (!state.busy) input.click();
}
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This image could not be opened by your browser.'));
    image.src = dataUrl;
  });
}
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}
async function importFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length || state.busy) return;
  const imageFiles = files.filter((file) => file.type.startsWith('image/'));
  const rejected = files.length - imageFiles.length;
  if (!imageFiles.length) {
    showToast('Choose image files such as JPG, PNG or WebP.', 'error');
    return;
  }
  let added = 0;
  let failed = 0;
  const importToast = imageFiles.length > 1 ? `Adding ${imageFiles.length} images…` : 'Adding image…';
  showToast(importToast);
  for (const file of imageFiles) {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImage(dataUrl);
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Image has no dimensions.');
      state.pages.push({
        id: makeId(), name: file.name || `page-${state.pages.length + 1}.jpg`, dataUrl,
        width: image.naturalWidth, height: image.naturalHeight, rotation: 0, brightness: 100, contrast: 100,
      });
      added += 1;
    } catch (error) {
      failed += 1;
      console.warn('PageBloom could not import an image:', file.name, error);
    }
  }
  if (added && !state.selectedId) state.selectedId = state.pages[0].id;
  if (added && state.selectedId && !state.pages.some((page) => page.id === state.selectedId)) state.selectedId = state.pages[0]?.id || null;
  renderPages();
  if (added) showToast(`${added} page${added === 1 ? '' : 's'} added${rejected || failed ? ' (some files were skipped)' : ''}.`);
  else showToast('Those images could not be imported. Try JPG or PNG files.', 'error');
  ui.fileInput.value = '';
  ui.cameraInput.value = '';
}
function selectedPage() { return state.pages.find((page) => page.id === state.selectedId) || null; }
function renderPages() {
  const count = state.pages.length;
  ui.pagesCount.textContent = `${count} ${count === 1 ? 'page' : 'pages'}`;
  ui.headingCount.textContent = String(count);
  ui.sidebarCount.textContent = String(count);
  ui.emptyState.hidden = count > 0;
  ui.pageGrid.hidden = count === 0;
  ui.exportButton.disabled = count === 0 || state.busy;
  ui.inspectorExport.disabled = count === 0 || state.busy;
  ui.previewButton.disabled = count === 0 || state.busy;
  if (!count) {
    state.selectedId = null;
    ui.pageGrid.innerHTML = '';
    renderSelectedPreview();
    return;
  }
  if (!state.pages.some((page) => page.id === state.selectedId)) state.selectedId = state.pages[0].id;
  ui.pageGrid.innerHTML = state.pages.map((page, index) => {
    const selected = page.id === state.selectedId;
    const rotation = ((page.rotation % 360) + 360) % 360;
    return `<article class="page-card${selected ? ' selected' : ''}" data-page-id="${escapeHtml(page.id)}" draggable="true" tabindex="0" aria-label="Page ${index + 1}, ${escapeHtml(page.name)}">
      <div class="page-card-top"><span class="page-number-chip">PAGE ${String(index + 1).padStart(2, '0')}</span><span class="drag-grip" title="Drag to reorder">${iconSvg('grip-vertical')}</span></div>
      <div class="page-image-wrap"><img src="${page.dataUrl}" alt="Preview of ${escapeHtml(page.name)}" style="transform:rotate(${rotation}deg);filter:brightness(${page.brightness}%) contrast(${page.contrast}%)" loading="lazy" /></div>
      <div class="page-card-footer"><span class="page-name" title="${escapeHtml(page.name)}">${escapeHtml(page.name)}</span><span class="page-meta">${page.width} × ${page.height} px</span></div>
      <div class="page-controls">
        <button class="page-control" type="button" data-action="rotate" title="Rotate page" aria-label="Rotate page ${index + 1}">${iconSvg('rotate-cw')}</button>
        <button class="page-control" type="button" data-action="select" title="Select page" aria-label="Select page ${index + 1}">${iconSvg('eye')}</button>
        <button class="page-control delete" type="button" data-action="delete" title="Remove page" aria-label="Remove page ${index + 1}">${iconSvg('trash-2')}</button>
      </div>
    </article>`;
  }).join('');
  renderSelectedPreview();
}
function renderSelectedPreview() {
  const page = selectedPage();
  const previewImg = $('#selected-page-preview');
  const previewEmpty = $('#selected-preview-empty');
  const pageLabel = $('#selected-preview-label');
  if (!previewImg || !previewEmpty) return;
  if (!page) {
    previewImg.hidden = true;
    previewEmpty.hidden = false;
    if (pageLabel) pageLabel.textContent = 'Nothing selected';
    return;
  }
  previewImg.src = page.dataUrl;
  previewImg.style.transform = `rotate(${page.rotation}deg)`;
  previewImg.style.filter = `brightness(${page.brightness}%) contrast(${page.contrast}%)`;
  previewImg.hidden = false;
  previewEmpty.hidden = true;
  if (pageLabel) pageLabel.textContent = page.name;
  const brightness = $('#brightness-range');
  const contrast = $('#contrast-range');
  if (brightness) { brightness.value = String(page.brightness); $('#brightness-value').textContent = `${page.brightness}%`; }
  if (contrast) { contrast.value = String(page.contrast); $('#contrast-value').textContent = `${page.contrast}%`; }
}
function setSelected(id) {
  if (!state.pages.some((page) => page.id === id)) return;
  state.selectedId = id;
  renderPages();
}
function rotatePage(id) {
  const page = state.pages.find((item) => item.id === id);
  if (!page) return;
  page.rotation = (page.rotation + 90) % 360;
  renderPages();
}
function deletePage(id) {
  const index = state.pages.findIndex((page) => page.id === id);
  if (index < 0) return;
  state.pages.splice(index, 1);
  if (state.selectedId === id) state.selectedId = state.pages[Math.min(index, state.pages.length - 1)]?.id || null;
  renderPages();
  showToast('Page removed from the document.');
}
function reorderPage(fromId, toId) {
  if (!fromId || !toId || fromId === toId) return;
  const from = state.pages.findIndex((page) => page.id === fromId);
  const to = state.pages.findIndex((page) => page.id === toId);
  if (from < 0 || to < 0) return;
  const [moving] = state.pages.splice(from, 1);
  state.pages.splice(to, 0, moving);
  renderPages();
  showToast('Page order updated.');
}
function updateBusy(isBusy, label = '') {
  state.busy = isBusy;
  const buttons = [ui.exportButton, ui.inspectorExport, ui.previewButton, ui.modalDownload];
  buttons.forEach((button) => { if (button) button.disabled = isBusy || (button !== ui.modalDownload && state.pages.length === 0); });
  ui.exportButton.innerHTML = isBusy ? `${iconSvg('rotate-cw')}<span>${escapeHtml(label || 'Preparing…')}</span>` : `${iconSvg('download')}<span>Export PDF</span>`;
  ui.inspectorExport.innerHTML = isBusy ? `${iconSvg('rotate-cw')}<span>${escapeHtml(label || 'Preparing…')}</span>` : `${iconSvg('download')}<span>Create my PDF</span>`;
  ui.previewButton.innerHTML = `${iconSvg('eye')} Preview PDF`;
  if (ui.modalDownload) ui.modalDownload.innerHTML = `${iconSvg('download')} Download PDF`;
}
function normalizeFilename(name) {
  let result = String(name || 'my-document').trim().replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  if (!result) result = 'my-document';
  return `${result.slice(0, 70)}.pdf`;
}
function formatNum(value) { return Number(value.toFixed(3)).toString(); }
function asciiBytes(text) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff;
  return bytes;
}
function byteLength(chunks) { return chunks.reduce((sum, chunk) => sum + chunk.length, 0); }
function combineBytes(chunks) {
  const result = new Uint8Array(byteLength(chunks));
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
function makeObject(id, chunks) { return { id, chunks: chunks.map((chunk) => typeof chunk === 'string' ? asciiBytes(chunk) : chunk) }; }
function base64ToBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const raw = atob(dataUrl.slice(comma + 1));
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The browser could not encode one of the images.')), 'image/jpeg', quality / 100);
  });
}
async function makePageImage(page, quality) {
  const image = await loadImage(page.dataUrl);
  const maxDimension = 4200;
  const maxPixels = 12_000_000;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight), Math.sqrt(maxPixels / (image.naturalWidth * image.naturalHeight)));
  const sourceWidth = Math.max(1, Math.round(image.naturalWidth * scale));
  const sourceHeight = Math.max(1, Math.round(image.naturalHeight * scale));
  const rotation = ((page.rotation % 360) + 360) % 360;
  const rotated = rotation === 90 || rotation === 270;
  const canvas = document.createElement('canvas');
  canvas.width = rotated ? sourceHeight : sourceWidth;
  canvas.height = rotated ? sourceWidth : sourceHeight;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Your browser could not prepare an image for the PDF.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.filter = `brightness(${page.brightness ?? 100}%) contrast(${page.contrast ?? 100}%)`;
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(rotation * Math.PI / 180);
  context.drawImage(image, -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight);
  context.filter = 'none';
  const jpeg = await canvasToJpeg(canvas, quality);
  const bytes = new Uint8Array(await jpeg.arrayBuffer());
  const width = canvas.width;
  const height = canvas.height;
  canvas.width = 1; canvas.height = 1;
  return { bytes, width, height };
}
function getPaperSize(settings, imageWidth, imageHeight) {
  let width;
  let height;
  if (settings.paperSize === 'Letter') { width = 612; height = 792; }
  else if (settings.paperSize === 'A5') { width = 419.528; height = 595.276; }
  else if (settings.paperSize === 'Fit') {
    const desiredWidth = imageWidth * 0.75 + settings.margin * 2 * 72 / 25.4;
    const desiredHeight = imageHeight * 0.75 + settings.margin * 2 * 72 / 25.4;
    const ratio = Math.min(1, 1190.55 / Math.max(desiredWidth, desiredHeight));
    width = desiredWidth * ratio; height = desiredHeight * ratio;
  } else { width = 595.276; height = 841.89; }
  if (settings.orientation === 'landscape' && height > width) [width, height] = [height, width];
  if (settings.orientation === 'portrait' && width > height) [width, height] = [height, width];
  return { width, height };
}
function buildPageContent(imageWidth, imageHeight, pageWidth, pageHeight, settings, pageNumber) {
  const margin = Math.max(0, settings.margin * 72 / 25.4);
  const bottomInset = margin + (settings.pageNumbers ? 22 : 0);
  const innerWidth = Math.max(1, pageWidth - margin * 2);
  const innerHeight = Math.max(1, pageHeight - margin - bottomInset);
  let drawWidth = innerWidth;
  let drawHeight = innerHeight;
  if (settings.fit !== 'stretch') {
    const xScale = innerWidth / imageWidth;
    const yScale = innerHeight / imageHeight;
    const scale = settings.fit === 'cover' ? Math.max(xScale, yScale) : Math.min(xScale, yScale);
    drawWidth = imageWidth * scale;
    drawHeight = imageHeight * scale;
  }
  const x = margin + (innerWidth - drawWidth) / 2;
  const y = bottomInset + (innerHeight - drawHeight) / 2;
  let stream = `q\n${formatNum(margin)} ${formatNum(bottomInset)} ${formatNum(innerWidth)} ${formatNum(innerHeight)} re W n\n`;
  stream += `${formatNum(drawWidth)} 0 0 ${formatNum(drawHeight)} ${formatNum(x)} ${formatNum(y)} cm\n/Im0 Do\nQ\n`;
  if (settings.pageNumbers) {
    const numX = Math.max(8, pageWidth / 2 - String(pageNumber).length * 2.5);
    stream += `BT /F1 9 Tf 0.28 g 1 0 0 1 ${formatNum(numX)} 12 Tm (${pageNumber}) Tj ET\n`;
  }
  return stream;
}
async function generatePdfBlob() {
  if (!state.pages.length) throw new Error('Add at least one image before creating a PDF.');
  const settings = {
    orientation: state.orientation, paperSize: state.paperSize, margin: state.margin,
    fit: state.fit, quality: state.quality, pageNumbers: state.pageNumbers,
  };
  const pageEntries = [];
  const objects = [makeObject(1, ['1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'])];
  const fontId = 3 + state.pages.length * 3;
  let nextObjectId = 3;
  for (let index = 0; index < state.pages.length; index += 1) {
    const page = state.pages[index];
    const image = await makePageImage(page, settings.quality);
    const dims = getPaperSize(settings, image.width, image.height);
    const pageId = nextObjectId;
    const contentId = nextObjectId + 1;
    const imageId = nextObjectId + 2;
    nextObjectId += 3;
    const contentStream = buildPageContent(image.width, image.height, dims.width, dims.height, settings, index + 1);
    const contentBytes = asciiBytes(contentStream);
    objects.push(makeObject(pageId, [`${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatNum(dims.width)} ${formatNum(dims.height)}] /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 ${imageId} 0 R >> /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`]));
    objects.push(makeObject(contentId, [`${contentId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`, contentBytes, '\nendstream\nendobj\n']));
    objects.push(makeObject(imageId, [`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`, image.bytes, '\nendstream\nendobj\n']));
    pageEntries.push(`${pageId} 0 R`);
    if (index < state.pages.length - 1) {
      // Yield between pages so the UI remains responsive on larger documents.
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
  }
  const pagesObject = makeObject(2, [`2 0 obj\n<< /Type /Pages /Kids [${pageEntries.join(' ')}] /Count ${pageEntries.length} >>\nendobj\n`]);
  objects.push(makeObject(fontId, [`${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`]));
  // Objects 3+ refer to the shared font object, which is defined after page objects.
  objects.push(pagesObject);
  objects.sort((a, b) => a.id - b.id);
  const header = asciiBytes('%PDF-1.4\n% PageBloom PDF Studio\n');
  const chunks = [header];
  const offsets = new Array(fontId + 1).fill(0);
  let cursor = header.length;
  for (const object of objects) {
    offsets[object.id] = cursor;
    chunks.push(...object.chunks);
    cursor += byteLength(object.chunks);
  }
  const xrefOffset = cursor;
  let xref = `xref\n0 ${fontId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= fontId; id += 1) xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(asciiBytes(xref + trailer));
  return new Blob([combineBytes(chunks)], { type: 'application/pdf' });
}
function downloadBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = normalizeFilename(state.fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1800);
}
async function exportPdf() {
  if (!state.pages.length || state.busy) return;
  updateBusy(true, 'Creating PDF…');
  try {
    const blob = await generatePdfBlob();
    downloadBlob(blob);
    showToast(`PDF created · ${state.pages.length} page${state.pages.length === 1 ? '' : 's'}.`);
  } catch (error) {
    console.error(error);
    showToast(error.message || 'PDF creation failed. Try fewer or smaller images.', 'error');
  } finally {
    updateBusy(false);
  }
}
function revokePreviewUrl() {
  if (state.currentPdfUrl) URL.revokeObjectURL(state.currentPdfUrl);
  state.currentPdfUrl = null;
  state.currentPdfBlob = null;
}
function openModal({ title, kicker, bodyHtml, showDownload = true, footerNote = '' }) {
  ui.modalTitle.textContent = title;
  ui.modalKicker.textContent = kicker;
  ui.modalBody.innerHTML = bodyHtml;
  ui.modalFooterNote.textContent = footerNote;
  ui.modalDownload.hidden = !showDownload;
  ui.modalBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  ui.modalClose.focus();
}
function closeModal() {
  ui.modalBackdrop.hidden = true;
  document.body.style.overflow = '';
  revokePreviewUrl();
  ui.modalDownload.hidden = false;
}
async function previewPdf() {
  if (!state.pages.length || state.busy) return;
  revokePreviewUrl();
  openModal({
    title: 'PDF preview', kicker: 'YOUR DOCUMENT', showDownload: true,
    footerNote: `${state.pages.length} page${state.pages.length === 1 ? '' : 's'} · In your chosen order`,
    bodyHtml: `<div class="preview-loading"><span class="spinner"></span><strong>Preparing your preview…</strong><span>This stays on your device.</span></div>`,
  });
  updateBusy(true, 'Preparing preview…');
  try {
    state.currentPdfBlob = await generatePdfBlob();
    state.currentPdfUrl = URL.createObjectURL(state.currentPdfBlob);
    ui.modalBody.innerHTML = '';
    const frame = document.createElement('iframe');
    frame.title = 'Generated PDF preview';
    frame.src = state.currentPdfUrl;
    ui.modalBody.appendChild(frame);
    showToast('Preview ready. Check the pages before downloading.');
  } catch (error) {
    console.error(error);
    ui.modalBody.innerHTML = `<div class="preview-loading"><span>${iconSvg('info')}</span><strong>Preview could not be created</strong><span>${escapeHtml(error.message || 'Try exporting fewer or smaller images.')}</span></div>`;
    showToast(error.message || 'PDF preview failed.', 'error');
  } finally {
    updateBusy(false);
    ui.modalDownload.disabled = !state.currentPdfBlob;
  }
}
function showHelp() {
  revokePreviewUrl();
  openModal({
    title: 'How PageBloom works', kicker: 'A TINY FIELD GUIDE', showDownload: false,
    footerNote: 'Your images are processed in this browser. Nothing is uploaded.',
    bodyHtml: `<div class="help-content"><p>PageBloom turns image files into a single PDF. Start with photos or scans, arrange the pages, set the paper shape, then export.</p><div class="help-steps"><div class="help-step"><b>01 · Add pages</b><span>Choose multiple images, or use your phone camera. Add more whenever you need.</span></div><div class="help-step"><b>02 · Arrange</b><span>Drag cards to reorder. Select a page, rotate it, or remove it from the document.</span></div><div class="help-step"><b>03 · Export</b><span>Choose paper size, margins, image fit and quality. Preview before downloading.</span></div></div><p><strong>Install on your phone:</strong> publish the folder to an HTTPS host. On iPhone, open the link in Safari, tap Share, then Add to Home Screen. On Android, open it in Chrome and choose Install app or Add to Home screen.</p><p><strong>Local use:</strong> you can open <code>index.html</code> directly to test the core features. PWA installation and offline caching require a local web server or HTTPS hosting.</p></div>`,
  });
}
function updateSettingButtons(selector, attribute, selectedValue) {
  $$(selector).forEach((button) => button.classList.toggle('active', button.getAttribute(attribute) === selectedValue));
}
function initEvents() {
  installIcons();
  $('#export-icon').innerHTML = iconSvg('download');
  $('#help-button').innerHTML = iconSvg('info');
  ui.modalClose.innerHTML = iconSvg('x');

  $('#choose-files').addEventListener('click', (event) => { event.stopPropagation(); openFilePicker(); });
  $('#empty-choose').addEventListener('click', () => openFilePicker());
  $('#sidebar-import').addEventListener('click', () => openFilePicker());
  $('#add-more-button').addEventListener('click', () => openFilePicker());
  $('#sidebar-camera').addEventListener('click', () => openFilePicker(ui.cameraInput));
  $('#clear-workspace').addEventListener('click', () => {
    if (!state.pages.length) { showToast('Your workspace is already empty.'); return; }
    if (!window.confirm('Remove all pages from this workspace? This cannot be undone.')) return;
    state.pages = []; state.selectedId = null; renderPages(); showToast('Workspace cleared.');
  });
  ui.fileInput.addEventListener('change', (event) => importFiles(event.target.files));
  ui.cameraInput.addEventListener('change', (event) => importFiles(event.target.files));
  ui.dropzone.addEventListener('click', (event) => { if (!event.target.closest('button')) openFilePicker(); });
  ui.dropzone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openFilePicker(); } });
  [ui.dropzone].forEach((node) => {
    node.addEventListener('dragover', (event) => { event.preventDefault(); if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'; ui.dropzone.classList.add('drag-over'); });
    node.addEventListener('dragleave', (event) => { if (!node.contains(event.relatedTarget)) ui.dropzone.classList.remove('drag-over'); });
    node.addEventListener('drop', (event) => {
      event.preventDefault(); ui.dropzone.classList.remove('drag-over');
      const files = event.dataTransfer?.files;
      if (files && files.length) importFiles(files);
    });
  });
  ui.pageGrid.addEventListener('dragstart', (event) => {
    const card = event.target.closest('.page-card');
    if (!card) return;
    state.draggedId = card.dataset.pageId;
    card.classList.add('dragging');
    if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', state.draggedId); }
  });
  ui.pageGrid.addEventListener('dragover', (event) => {
    const card = event.target.closest('.page-card');
    if (!card) return;
    event.preventDefault();
    $$('.page-card.drag-target', ui.pageGrid).forEach((item) => item.classList.remove('drag-target'));
    card.classList.add('drag-target');
  });
  ui.pageGrid.addEventListener('drop', (event) => {
    const target = event.target.closest('.page-card');
    const fileList = event.dataTransfer?.files;
    if (target && state.draggedId) { event.preventDefault(); reorderPage(state.draggedId, target.dataset.pageId); }
    else if (fileList?.length) importFiles(fileList);
  });
  ui.pageGrid.addEventListener('dragend', () => {
    state.draggedId = null;
    $$('.page-card', ui.pageGrid).forEach((card) => card.classList.remove('dragging', 'drag-target'));
  });
  ui.pageGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.page-card');
    if (!card) return;
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'rotate') { rotatePage(card.dataset.pageId); return; }
    if (action === 'delete') { deletePage(card.dataset.pageId); return; }
    setSelected(card.dataset.pageId);
  });
  ui.pageGrid.addEventListener('keydown', (event) => {
    const card = event.target.closest('.page-card');
    if (!card || event.target.closest('button')) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelected(card.dataset.pageId); }
  });
  $$('.segment').forEach((button) => button.addEventListener('click', () => {
    state.orientation = button.dataset.orientation;
    updateSettingButtons('.segment', 'data-orientation', state.orientation);
  }));
  ui.paperSize.addEventListener('change', () => { state.paperSize = ui.paperSize.value; });
  ui.marginRange.addEventListener('input', () => { state.margin = Number(ui.marginRange.value); ui.marginValue.textContent = `${state.margin} mm`; });
  ui.qualityRange.addEventListener('input', () => { state.quality = Number(ui.qualityRange.value); ui.qualityValue.textContent = `${state.quality}%`; });
  $$('.fit-option').forEach((button) => button.addEventListener('click', () => {
    state.fit = button.dataset.fit;
    updateSettingButtons('.fit-option', 'data-fit', state.fit);
  }));
  ui.pageNumbers.addEventListener('change', () => { state.pageNumbers = ui.pageNumbers.checked; });
  ui.fileName.addEventListener('input', () => { state.fileName = ui.fileName.value; });
  $('#brightness-range').addEventListener('input', (event) => {
    const page = selectedPage();
    if (!page) { showToast('Add and select a page first.'); return; }
    page.brightness = Number(event.target.value);
    $('#brightness-value').textContent = `${page.brightness}%`;
    renderSelectedPreview();
    const card = $(`.page-card[data-page-id="${CSS.escape(page.id)}"]`);
    const image = card?.querySelector('img');
    if (image) image.style.filter = `brightness(${page.brightness}%) contrast(${page.contrast}%)`;
  });
  $('#contrast-range').addEventListener('input', (event) => {
    const page = selectedPage();
    if (!page) { showToast('Add and select a page first.'); return; }
    page.contrast = Number(event.target.value);
    $('#contrast-value').textContent = `${page.contrast}%`;
    renderSelectedPreview();
    const card = $(`.page-card[data-page-id="${CSS.escape(page.id)}"]`);
    const image = card?.querySelector('img');
    if (image) image.style.filter = `brightness(${page.brightness}%) contrast(${page.contrast}%)`;
  });
  $('#reset-adjustments').addEventListener('click', () => {
    const page = selectedPage();
    if (!page) { showToast('Add and select a page first.'); return; }
    page.brightness = 100; page.contrast = 100;
    renderSelectedPreview();
    const card = $(`.page-card[data-page-id="${CSS.escape(page.id)}"]`);
    const image = card?.querySelector('img');
    if (image) image.style.filter = 'brightness(100%) contrast(100%)';
    showToast('Page adjustments reset.');
  });
  $('#export-button').addEventListener('click', exportPdf);
  $('#inspector-export').addEventListener('click', exportPdf);
  $('#preview-button').addEventListener('click', previewPdf);
  $('#help-button').addEventListener('click', showHelp);
  ui.modalClose.addEventListener('click', closeModal);
  ui.modalBackdrop.addEventListener('click', (event) => { if (event.target === ui.modalBackdrop) closeModal(); });
  ui.modalDownload.addEventListener('click', () => {
    if (state.currentPdfBlob) { downloadBlob(state.currentPdfBlob); showToast('Your PDF download has started.'); closeModal(); }
    else showToast('The PDF preview is still being prepared.', 'error');
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !ui.modalBackdrop.hidden) closeModal(); });
  document.addEventListener('dragover', (event) => event.preventDefault());
  document.addEventListener('drop', (event) => { if (event.target === document.body || event.target === document.documentElement) event.preventDefault(); });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch((error) => console.info('PWA offline caching is unavailable in this environment:', error)));
  }
}

initEvents();
renderPages();
