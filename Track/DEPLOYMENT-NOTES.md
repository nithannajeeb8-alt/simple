# Pocketwise Track v5.2.0

## Deploy

1. Back up the existing `/Track/` files before replacing them.
2. Extract this archive.
3. Upload or commit the **contents** of this folder to the existing `/Track/` deployment directory. Keep `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, and the `assets/` directory at the same level as before. Do not add an extra wrapper directory.
4. Open `/Track/` and let the service worker update. The cache name was bumped to `pocketwise-shell-v5.2.0` so the app can replace the previous cached shell.

## What changed

- Consolidated the accumulated CSS repair layers into one final visual layer.
- Added a premium dual-tone ink/blue-to-sage theme, calmer card surfaces, more consistent spacing and clearer content hierarchy.
- Improved narrow-screen layouts, button sizing, long-text wrapping, receipt modal scrolling and fixed action placement.
- Highlighted today's date in the spending calendar and improved its accessibility label.
- Fixed a global click-delegation bug: the old `[data-page]` selector also matched `body[data-page="home"]`, which could swallow ordinary click actions. Navigation now matches navigation buttons only.
- Made receipt close cleanup reliable and ensured the hidden dialog does not override native closed-dialog behavior.
- Added a local PDF receipt generator and a Save/Share fallback for iOS Home Screen mode where `window.print()` may not open the system print flow.
- Updated the service worker cache version and PWA theme colors.

## Data compatibility

No remote API, new framework, or storage-schema migration was added. Existing transaction, account, budget, debt, reminder, and backup features remain in the bundle. Receipt PDFs are generated on-device from the record currently displayed. The receipt clearly identifies itself as a personal record rather than a bank- or UPI-issued proof of settlement.
