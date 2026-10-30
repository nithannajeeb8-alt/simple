/* PocketWise local clipboard import bridge.
 * Reads copied images (PNG on WebKit) and legacy transaction text/URLs/JSON.
 * The caller must invoke read() directly from a user-initiated button handler.
 */
(function attachPocketWiseClipboardImport(root) {
  'use strict';

  const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
  const IMAGE_EXTENSIONS = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/heic': 'heic',
    'image/heif': 'heif'
  };

  function makeImageFile(blob, mimeType) {
    const type = String(mimeType || blob?.type || '').toLowerCase();
    if (!type.startsWith('image/')) throw new Error('The clipboard item is not an image.');
    if (!blob || !Number.isFinite(blob.size) || blob.size <= 0) {
      throw new Error('The copied image is empty. Copy the screenshot again and retry.');
    }
    if (blob.size > MAX_IMAGE_BYTES) {
      throw new Error('The copied image is larger than 15 MB. Copy a smaller screenshot.');
    }
    const extension = IMAGE_EXTENSIONS[type] || 'png';
    const name = `pocketwise-clipboard-${Date.now()}.${extension}`;
    try {
      return new File([blob], name, { type, lastModified: Date.now() });
    } catch (_) {
      try { Object.defineProperty(blob, 'name', { value: name, configurable: true }); } catch (__) {}
      return blob;
    }
  }

  async function readClipboardImport() {
    const clipboard = root.navigator?.clipboard;
    if (!clipboard) throw new Error('Clipboard access is unavailable. Open PocketWise over HTTPS and try again.');

    let readError = null;
    if (typeof clipboard.read === 'function') {
      try {
        const items = await clipboard.read();
        const safeItems = Array.isArray(items) ? items : [];

        // Prefer image bytes over accompanying text so a copied payment screenshot
        // cannot accidentally be parsed as an old transaction payload.
        for (const item of safeItems) {
          const types = Array.from(item?.types || []);
          const imageType = types.find(type => typeof type === 'string' && type.toLowerCase().startsWith('image/'));
          if (!imageType || typeof item.getType !== 'function') continue;
          const blob = await item.getType(imageType);
          return { kind: 'image', file: makeImageFile(blob, imageType) };
        }

        // New and old PocketWise Shortcuts may place their payload in text/plain.
        for (const item of safeItems) {
          const types = Array.from(item?.types || []);
          if (!types.includes('text/plain') || typeof item.getType !== 'function') continue;
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          if (String(text || '').trim()) return { kind: 'text', text: String(text) };
        }
      } catch (error) {
        readError = error;
      }
    }

    // Older Safari versions and older shortcuts expose text only through readText().
    if (typeof clipboard.readText === 'function') {
      try {
        const text = await clipboard.readText();
        if (String(text || '').trim()) return { kind: 'text', text: String(text) };
      } catch (error) {
        if (!readError) readError = error;
      }
    }

    if (readError) throw readError;
    throw new Error('No image or PocketWise transaction was found on the clipboard. For screenshots, use the updated Shortcut to copy the image first.');
  }

  root.PocketWiseClipboardImport = Object.freeze({ read: readClipboardImport });
})(typeof window !== 'undefined' ? window : globalThis);
