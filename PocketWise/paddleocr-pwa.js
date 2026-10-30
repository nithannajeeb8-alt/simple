/*
 * PocketWise PaddleOCR browser integration.
 * Uses the official @paddleocr/paddleocr-js PP-OCRv6 small models and local OCR.
 * Paddle model archives are cached on this origin after first download for offline use.
 * Receipt pixels are passed only to local browser inference; they are never uploaded.
 */
(function () {
  'use strict';

  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm';
  const MODEL_NAMES = Object.freeze({ det: 'PP-OCRv6_small_det', rec: 'PP-OCRv6_small_rec' });
  const MODEL_CACHE = 'pocketwise-paddle-models-v243';
  const SDK_RUNTIME_CACHE = 'pocketwise-paddle-runtime-v243';
  const MODEL_BOS = 'https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/';
  const MODEL_HF = 'https://huggingface.co/PaddlePaddle/';
  const MAX_TILE_SIDE = 2200;
  const TILE_OVERLAP = 260;
  let enginePromise = null;
  const objectUrls = [];

  function report(onStatus, message) {
    if (typeof onStatus === 'function') { try { onStatus(message); } catch (_) { /* status is non-critical */ } }
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function makeKey(name) { return new Request(new URL('/__pocketwise_ocr_models__/' + name + '.tar', location.origin).href); }

  async function readCachedModel(name) {
    try {
      if (!('caches' in window)) return null;
      const cache = await caches.open(MODEL_CACHE);
      const hit = await cache.match(makeKey(name));
      return hit ? await hit.blob() : null;
    } catch (_) { return null; }
  }
  async function cacheModel(name, blob) {
    try {
      if (!('caches' in window)) return false;
      const cache = await caches.open(MODEL_CACHE);
      await cache.put(makeKey(name), new Response(blob, { headers: { 'Content-Type': 'application/x-tar' } }));
      return true;
    } catch (error) {
      console.warn('PocketWise could not persist PaddleOCR model cache.', error);
      return false;
    }
  }
  async function fetchBytes(url, minimumBytes) {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
    if (!response.ok) throw new Error('PaddleOCR model download failed (' + response.status + ').');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length < (Number.isFinite(minimumBytes) ? minimumBytes : 100000)) throw new Error('PaddleOCR model asset is unexpectedly small.');
    return bytes;
  }
  function writeText(view, offset, length, value) {
    const bytes = new TextEncoder().encode(String(value));
    view.set(bytes.subarray(0, length), offset);
  }
  function writeOctal(view, offset, length, value) {
    const text = Math.floor(value).toString(8).padStart(length - 1, '0') + '\0';
    writeText(view, offset, length, text);
  }
  function tarHeader(name, size) {
    const header = new Uint8Array(512), view = new DataView(header.buffer);
    writeText(header, 0, 100, name);
    writeOctal(header, 100, 8, 0o644); writeOctal(header, 108, 8, 0); writeOctal(header, 116, 8, 0);
    writeOctal(header, 124, 12, size); writeOctal(header, 136, 12, Math.floor(Date.now() / 1000));
    for (let i = 148; i < 156; i++) header[i] = 32;
    header[156] = 48; writeText(header, 257, 6, 'ustar\0'); writeText(header, 263, 2, '00');
    let checksum = 0; for (let i = 0; i < header.length; i++) checksum += header[i];
    writeText(header, 148, 8, checksum.toString(8).padStart(6, '0') + '\0 ');
    return header;
  }
  function buildUstar(files) {
    const chunks = [], zero = new Uint8Array(512);
    files.forEach(function (file) {
      const data = file.bytes, header = tarHeader(file.name, data.length);
      chunks.push(header, data);
      const pad = (512 - (data.length % 512)) % 512;
      if (pad) chunks.push(new Uint8Array(pad));
    });
    chunks.push(zero, zero);
    return new Blob(chunks, { type: 'application/x-tar' });
  }
  async function downloadModel(name, onStatus) {
    const cached = await readCachedModel(name);
    if (cached) { report(onStatus, 'Using cached PaddleOCR model: ' + name + '.'); return cached; }
    report(onStatus, 'Downloading PaddleOCR model ' + name + ' (first use only)…');
    let blob = null, lastError = null;
    // Paddle's official model host occasionally omits CORS headers on a shared cache entry.
    const attempts = [MODEL_BOS + name + '_onnx_infer.tar?src=pocketwise', MODEL_BOS + name + '_onnx_infer.tar?retry=' + Math.random().toString(36).slice(2)];
    for (const url of attempts) {
      try { blob = new Blob([await fetchBytes(url)], { type: 'application/x-tar' }); break; }
      catch (error) { lastError = error; }
    }
    if (!blob) {
      report(onStatus, 'Trying PaddleOCR model mirror…');
      try {
        const base = MODEL_HF + name + '_onnx/resolve/main/';
        const [onnx, yml] = await Promise.all([fetchBytes(base + 'inference.onnx', 100000), fetchBytes(base + 'inference.yml', 20)]);
        blob = buildUstar([{ name: 'inference.onnx', bytes: onnx }, { name: 'inference.yml', bytes: yml }]);
      } catch (error) { lastError = error; }
    }
    if (!blob) throw new Error('PaddleOCR could not download ' + name + '. Connect once to install its offline model. ' + (lastError && lastError.message || ''));
    const saved = await cacheModel(name, blob);
    report(onStatus, saved
      ? 'PaddleOCR model cached for later use: ' + name + '.'
      : 'PaddleOCR model loaded, but browser storage could not cache it. Offline scans are not guaranteed.');
    return blob;
  }

  async function loadSdk(onStatus) {
    report(onStatus, 'Loading official PaddleOCR browser runtime…');
    const sdk = await import(SDK_URL);
    if (!sdk || !sdk.PaddleOCR || typeof sdk.PaddleOCR.create !== 'function') throw new Error('PaddleOCR browser SDK did not expose PaddleOCR.create().');
    return sdk.PaddleOCR;
  }
  async function createEngine(onStatus) {
    if (enginePromise) return enginePromise;
    enginePromise = (async function () {
      const PaddleOCR = await loadSdk(onStatus);
      const [detBlob, recBlob] = await Promise.all([
        downloadModel(MODEL_NAMES.det, onStatus), downloadModel(MODEL_NAMES.rec, onStatus)
      ]);
      const detUrl = URL.createObjectURL(detBlob), recUrl = URL.createObjectURL(recBlob);
      objectUrls.push(detUrl, recUrl);
      report(onStatus, 'Initialising PaddleOCR PP-OCRv6 small…');
      const engine = await PaddleOCR.create({
        textDetectionModelName: MODEL_NAMES.det,
        textDetectionModelAsset: { url: detUrl },
        textRecognitionModelName: MODEL_NAMES.rec,
        textRecognitionModelAsset: { url: recUrl },
        ortOptions: { backend: 'auto', numThreads: 1, simd: true }
      });
      if (!engine || typeof engine.predict !== 'function') throw new Error('PaddleOCR did not initialise correctly.');
      return engine;
    })().catch(function (error) { enginePromise = null; throw error; });
    return enginePromise;
  }

  async function toCanvas(input) {
    if (input && input.getContext && Number(input.width) && Number(input.height)) return input;
    let bitmap;
    if (typeof createImageBitmap === 'function') bitmap = await createImageBitmap(input);
    else {
      const url = URL.createObjectURL(input);
      try {
        const img = new Image(); img.decoding = 'async'; img.src = url;
        await (img.decode ? img.decode() : new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }));
        const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0); return canvas;
      } finally { URL.revokeObjectURL(url); }
    }
    try {
      const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas is unavailable for local OCR.');
      ctx.drawImage(bitmap, 0, 0); return canvas;
    } finally { bitmap.close && bitmap.close(); }
  }
  function tileRects(width, height) {
    const rects = [];
    function starts(size) {
      if (size <= MAX_TILE_SIDE) return [0];
      const stride = MAX_TILE_SIDE - TILE_OVERLAP, result = [0];
      let pos = 0;
      while (pos + MAX_TILE_SIDE < size) {
        let next = pos + stride;
        // If the next standard tile would leave only a sliver uncovered, shift that
        // final tile to the edge instead of adding a near-duplicate crop.
        const uncovered = size - (next + MAX_TILE_SIDE);
        if (uncovered > 0 && uncovered < TILE_OVERLAP) next = size - MAX_TILE_SIDE;
        if (next <= pos || result.includes(next)) break;
        result.push(next);
        pos = next;
      }
      return result;
    }
    const xs = starts(width), ys = starts(height);
    ys.forEach(y => xs.forEach(x => rects.push({ x, y, width: Math.min(MAX_TILE_SIDE, width - x), height: Math.min(MAX_TILE_SIDE, height - y) })));
    return rects;
  }
  function canvasTile(source, rect, invert) {
    const canvas = document.createElement('canvas'); canvas.width = rect.width; canvas.height = rect.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height), data = image.data;
    // PaddleOCR's Latin recognizer is strongest with dark characters on a light paper field.
    // Invert dark-mode cards locally; do not force an inverted version for normal receipts.
    const step = Math.max(4, Math.floor((data.length / 4) / 2400)); let dark = 0, samples = 0;
    for (let p = 0; p < data.length; p += step * 4) { const g = data[p] * .299 + data[p + 1] * .587 + data[p + 2] * .114; if (g < 118) dark++; samples++; }
    const darkRatio = samples ? dark / samples : 0;
    const shouldInvert = invert === true || (invert !== false && darkRatio > .56);
    for (let p = 0; p < data.length; p += 4) {
      const gray = data[p] * .299 + data[p + 1] * .587 + data[p + 2] * .114;
      let v = shouldInvert ? 255 - gray : gray;
      // Mild local contrast expansion helps compressed screenshots without binarising strokes.
      v = clamp((v - 126) * 1.10 + 126, 0, 255);
      data[p] = data[p + 1] = data[p + 2] = v;
    }
    ctx.putImageData(image, 0, 0);
    return { canvas: canvas, inverted: shouldInvert, darkRatio: darkRatio };
  }
  function polygonBounds(poly) {
    if (!Array.isArray(poly) || !poly.length) return null;
    const points = Array.isArray(poly[0]) ? poly : [];
    if (!points.length) return null;
    const xs = points.map(p => Number(p[0])).filter(Number.isFinite), ys = points.map(p => Number(p[1])).filter(Number.isFinite);
    if (!xs.length || !ys.length) return null;
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  }
  function overlapRatio(a, b) {
    const x0 = Math.max(a.x0, b.x0), y0 = Math.max(a.y0, b.y0), x1 = Math.min(a.x1, b.x1), y1 = Math.min(a.y1, b.y1);
    const intersection = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    const areaA = Math.max(1, (a.x1 - a.x0) * (a.y1 - a.y0)), areaB = Math.max(1, (b.x1 - b.x0) * (b.y1 - b.y0));
    return intersection / Math.min(areaA, areaB);
  }
  function dedupeItems(items) {
    const sorted = items.filter(item => item.text && item.poly).sort((a, b) => (b.score || 0) - (a.score || 0));
    const kept = [];
    sorted.forEach(item => {
      const box = polygonBounds(item.poly); if (!box) return;
      const textKey = item.text.toLowerCase().replace(/[^a-z0-9₹@.]/g, '');
      const duplicate = kept.find(other => {
        const otherBox = polygonBounds(other.poly);
        return other.text.toLowerCase().replace(/[^a-z0-9₹@.]/g, '') === textKey && otherBox && overlapRatio(box, otherBox) > .48;
      });
      if (!duplicate) kept.push(item);
    });
    return kept.sort((a, b) => {
      const A = polygonBounds(a.poly), B = polygonBounds(b.poly);
      return (A.y0 + A.y1) - (B.y0 + B.y1) || A.x0 - B.x0;
    });
  }
  async function predictOne(engine, canvas, relaxed) {
    const options = relaxed ? {
      textDetLimitSideLen: 1600, textDetLimitType: 'max', textDetMaxSideLimit: 2400,
      textDetThresh: .22, textDetBoxThresh: .34, textDetUnclipRatio: 1.9, textRecScoreThresh: 0
    } : {
      textDetLimitSideLen: 1600, textDetLimitType: 'max', textDetMaxSideLimit: 2400,
      textDetThresh: .28, textDetBoxThresh: .44, textDetUnclipRatio: 1.7, textRecScoreThresh: 0
    };
    const results = await engine.predict(canvas, options);
    return Array.isArray(results) && results[0] ? results[0] : null;
  }
  async function recognize(input, onStatus) {
    if (!input) throw new TypeError('PaddleOCR requires a receipt image.');
    const engine = await createEngine(onStatus);
    const source = await toCanvas(input), width = source.width, height = source.height;
    if (!width || !height) throw new Error('The selected image has no readable pixels.');
    const tiles = tileRects(width, height), collected = [], timings = [];
    report(onStatus, 'Detecting and reading receipt text with PaddleOCR…');
    for (let i = 0; i < tiles.length; i++) {
      const rect = tiles[i];
      const normal = canvasTile(source, rect, null);
      const variants = [normal];
      // Mixed receipts sometimes contain a dark card on a light page. Scan its inverse too.
      if (normal.darkRatio > .30 && normal.darkRatio <= .56) variants.push(canvasTile(source, rect, true));
      for (let v = 0; v < variants.length; v++) {
        const result = await predictOne(engine, variants[v].canvas, false);
        if (!result || !Array.isArray(result.items)) continue;
        (result.items || []).forEach(item => {
          const poly = item && item.poly;
          if (!Array.isArray(poly) || !poly.length) return;
          const mapped = poly.map(point => [Number(point[0]) + rect.x, Number(point[1]) + rect.y]);
          collected.push({ text: String(item.text || '').trim(), score: Number(item.score) || 0, poly: mapped });
        });
        if (result.metrics) timings.push(result.metrics);
      }
      report(onStatus, 'Reading receipt regions… ' + Math.round((i + 1) / tiles.length * 100) + '%');
    }
    let items = dedupeItems(collected);
    // Retry when there are very few lines OR Paddle did not retain any currency cue.
    // In particular, a leading ₹ misread as the digit 2 must not suppress the relaxed pass.
    const hasCurrencyCue = items.some(item => /₹|\bINR\b|\bRs\.?/i.test(item.text));
    if (items.length < 3 || !hasCurrencyCue) {
      report(onStatus, 'Retrying faint text with a more sensitive PaddleOCR detector…');
      for (const rect of tiles) {
        const tile = canvasTile(source, rect, null);
        const result = await predictOne(engine, tile.canvas, true);
        if (!result || !Array.isArray(result.items)) continue;
        result.items.forEach(item => {
          if (!Array.isArray(item.poly)) return;
          collected.push({ text: String(item.text || '').trim(), score: Number(item.score) || 0, poly: item.poly.map(point => [Number(point[0]) + rect.x, Number(point[1]) + rect.y]) });
        });
      }
      items = dedupeItems(collected);
    }
    const text = items.map(item => item.text).filter(Boolean).join('\n').trim();
    if (!text) throw new Error('PaddleOCR could not find readable text. Try a clearer image or paste the payment text manually.');
    return {
      text: text,
      engine: 'PaddleOCR.js PP-OCRv6 small',
      items: items,
      image: { width: width, height: height, tiles: tiles.length },
      metrics: timings
    };
  }

  window.PocketWisePaddleWebOCR = Object.freeze({
    recognize: recognize,
    // Exposed for deterministic geometry regression tests; the app UI does not call this.
    getTilePlan: function (width, height) { return tileRects(width, height).map(rect => Object.assign({}, rect)); },
    clearEngine: async function () {
    if (enginePromise) { try { const engine = await enginePromise; if (engine && typeof engine.dispose === 'function') await engine.dispose(); } catch (_) {} }
    enginePromise = null;
  } });
}());
