# Quiet Pages v18: editor reliability and palette update

This is a static, PWA-only project. It has no build step and no native iOS project. The update preserves the existing IndexedDB/localStorage keys and migrates older entries by adding optional `tags` and photo `caption` fields during normalisation.

## Included changes

- Adds Rose, Peach, Sand, and Ocean to the existing Sky, Coral, Mint, Lavender, and Dynamic background palette.
- Adds the same four themes to individual entry themes and the diary-card palette rotation.
- Improves rich-text toolbar selection retention: captures the editor range before toolbar interaction, avoids preventing native select/color-picker interactions, restores selection after asynchronous font loading, and avoids dismissing the toolbar on transient Android focus loss.
- Adds five font choices: Caveat, Lora, Patrick Hand, DM Sans, and EB Garamond. It also caches the current UI fonts Manrope and Playfair Display.
- Font binaries are downloaded from Google Fonts on first online use and stored in Cache Storage. They can be loaded from that cache later while offline. They are **not embedded as binary files in this ZIP**; first use requires a successful online fetch. If the device is offline before the font is cached, the app uses a system fallback.
- Adds font colour and highlight controls (retains the existing controls), plus divider and decorative sparkle blocks.
- Adds tags to entries, cards and detail pages. Tags and photo captions are included in local text search.
- Adds editable photo captions in the editor and captions in detail/gallery views.
- Calendar dates with a mood show that mood's emoji; dates without a mood retain the entry dot.
- Adds styled standalone HTML archive export.
- Before replacing data during backup restore, attempts to download a recovery JSON backup. Users should still manually export before restoring, because browsers may block automatic downloads.
- Increments the service-worker app-shell cache version. User data and font cache are separate from the shell cache.

## Deploy to GitHub Pages / Nithan.in

1. Export a Quiet Pages JSON backup from Settings before replacing files.
2. Copy `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icons/`, and `.nojekyll` into the same folder as the currently deployed PWA. Preserve any unrelated files in the repository.
3. Commit and push the changes. Do not change the repository's existing GitHub Pages base path; the project uses relative URLs and `self.registration.scope`.
4. Open the deployed app once while online so the new shell and font assets can be cached. Close and reopen the installed PWA after the service worker updates.
5. Confirm the version by opening the app and testing the font picker, formatting, themes, captions, tags, search, calendar and exports.

## Install on Android

1. Open the HTTPS deployment in current Chrome while online.
2. Wait for the page to finish loading, then use Chrome's menu → **Install app** or **Add to Home screen** (the label varies by Chrome version and site installability).
3. Launch the installed app from its icon, not only from the browser tab.
4. Test the font picker after selecting text, and test offline after opening each font at least once while online.
5. If an old app shell persists after deployment, fully close the installed app, reopen it while online, and allow the service worker to update. Do not clear site storage unless the user has exported and verified a backup.

## Install on a laptop

- **Chrome / Edge:** open the HTTPS site and use the install icon in the address bar, or the browser menu's Install page as app option when available.
- **Windows/macOS/Linux:** the same PWA files are used; there is no separate desktop build. The layout responds to desktop and mobile viewport sizes.
- Keep the app online for the first load of newly added font binaries; after successful font caching, the font loader can use its Cache Storage copy offline.

## Implementation references

- MDN, PWA caching: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
- MDN, service workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
- MDN, CSS Font Loading API: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API

## Verification completed for this package

- `node --check app.js` passes.
- `manifest.webmanifest` parses as JSON.
- HTML parses with Python's HTML parser.
- ZIP integrity check passes.

No physical Android or laptop browser was available for device-level testing in this build session. The focus-retention code is a compatibility fix based on standard pointer/focus and selection handling, but must still be verified on an installed Android PWA.
