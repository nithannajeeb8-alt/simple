/*
 * PocketWise browser PaddleOCR integration.
 * Lazy-loads the official PaddlePaddle browser SDK only when screenshot OCR is requested.
 * The caller must retain its existing OCR fallback when this engine rejects.
 * Copyright notices and license for the SDK remain with PaddlePaddle (Apache-2.0).
 */
(function () {
  'use strict';

  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@paddleocr/paddleocr-js@0.4.2/+esm';
  let enginePromise = null;

  function report(onStatus, message) {
    if (typeof onStatus === 'function') {
      try { onStatus(message); } catch (_) { /* Status updates must never break OCR. */ }
    }
  }

  async function createEngine(onStatus) {
    if (enginePromise) return enginePromise;

    enginePromise = (async function () {
      report(onStatus, 'Loading PaddleOCR browser engine…');
      const sdk = await import(SDK_URL);
      if (!sdk || !sdk.PaddleOCR || typeof sdk.PaddleOCR.create !== 'function') {
        throw new Error('PaddleOCR browser SDK did not expose PaddleOCR.create().');
      }

      report(onStatus, 'Loading PaddleOCR model (first use may take a while)…');
      // PP-OCRv6 tiny uses the official model assets and keeps first-use downloads smaller
      // for phones. Do not enable multi-threaded WASM: it can require cross-origin isolation.
      const engine = await sdk.PaddleOCR.create({
        textDetectionModelName: 'PP-OCRv6_tiny_det',
        textRecognitionModelName: 'PP-OCRv6_tiny_rec',
        ortOptions: {
          backend: 'wasm',
          numThreads: 1,
          simd: true
        }
      });

      if (!engine || typeof engine.predict !== 'function') {
        throw new Error('PaddleOCR browser engine did not initialise correctly.');
      }
      return engine;
    })().catch(function (error) {
      // Do not permanently cache a failed initialisation. A later attempt may succeed if
      // the device regains connectivity or the CDN/model host recovers.
      enginePromise = null;
      throw error;
    });

    return enginePromise;
  }

  async function recognize(input, onStatus) {
    if (!input) throw new TypeError('PaddleOCR requires an image.');
    const engine = await createEngine(onStatus);
    report(onStatus, 'Reading screenshot with PaddleOCR…');

    // PaddleOCR.js accepts Blob/File, ImageBitmap, ImageData, canvas and image elements.
    const results = await engine.predict(input);
    const result = Array.isArray(results) ? results[0] : null;
    const items = result && Array.isArray(result.items) ? result.items : [];
    const cleanItems = items.filter(function (item) { return String(item && item.text || '').trim(); });
    const text = cleanItems
      .map(function (item) { return String(item && item.text || '').trim(); })
      .join('\n')
      .trim();
    // Keep the line polygon and recognition score for local rupee-glyph verification.
    const boxes = cleanItems.map(function (item) {
      return {
        text: String(item && item.text || '').trim(),
        score: Number(item && item.score || 0),
        poly: item && (item.poly || item.box) || null
      };
    });
    return { text: text, engine: 'PaddleOCR.js', items: boxes };
  }

  // Small API consumed by the existing screenshot-import flow. No UI is created here.
  window.PocketWisePaddleWebOCR = Object.freeze({ recognize: recognize });
}());
