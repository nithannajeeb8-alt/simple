# Quiet Pages v19 — resource pack, scrapbook and export update

This static PWA project supports Android installed PWAs and laptop browsers through the same files. No native app or build step is required.

## Added in v19
- Print / Save as PDF action in Settings. Uses the browser/device print dialog, which can save to PDF where supported.
- Tag chips on diary cards can be tapped to search entries by that tag.
- Additional scrapbook sticker designs cycle through flower, moon, leaf, heart, butterfly, star and sparkle decorations.
- Bundled SVG paper texture and theme/sticker assets, precached by the service worker.
- Updated cache version.

## Features retained from v18
- Rose, Peach, Sand and Ocean themes alongside Sky, Coral, Mint, Lavender and Dynamic.
- Font picker, text colour/highlight, headings, quote, divider, inline image, tags, photo captions, mood calendar, full-text search, HTML export and JSON backup/restore.
- Existing IndexedDB/localStorage identifiers are preserved.

## Online resource research
- MDN PWA caching: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching
- MDN offline operation: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- Bootstrap Icons: https://icons.getbootstrap.com/
- Lucide icon library (ISC): https://github.com/lucide-icons/lucide
- Google Fonts: https://fonts.google.com/

## Resource-pack limitation
The paper textures and scrapbook SVG stickers are included locally. The existing UI icon font still loads Bootstrap Icons from jsDelivr, and the five typography fonts are fetched from Google Fonts then cached when possible. Their binary files could not be downloaded in this environment, so first-use internet is still required for those external resources.

## Deploy
1. Export a JSON backup before replacing files.
2. Extract this ZIP and copy `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icons/`, `assets/`, and `.nojekyll` into the existing GitHub Pages app directory.
3. Keep the current repository path and unrelated files. Commit and push.
4. Open the PWA online once, wait for the service worker update, then test the installed Android app and a laptop browser.

## PDF export
Settings → Print / Save as PDF opens the system print dialog. On Android choose Save as PDF if offered; on desktop choose a PDF printer/destination. The feature cannot silently write a PDF file without user confirmation.

## Validation
Run `node --check app.js`; validate the web manifest as JSON; confirm the ZIP integrity. Physical Android and laptop testing remains necessary for toolbar, font picker, print layout, offline assets and data migration.


## Notifications (v21 update)
- Settings includes an opt-in daily diary reminder, local time selector, notification permission control, and test notification.
- Reminder notification text never includes diary entry content.
- This PWA-only implementation checks reminders while the app is open/visible. It does not promise scheduled notifications after the app is fully closed. Reliable closed-app delivery requires a push server/service and subscription flow.
- On iPhone, install Quiet Pages to the Home Screen and open it there for the best notification support; grant permission when prompted. Browser/OS support and permission settings still apply.


## v22 additions (privacy, motivational notifications, scrapbook notes)
- First-run privacy notice explains local browser storage, local-model processing, third-party runtime/font/icon downloads, backup caveats, and that local storage is not encryption. It appears once per browser profile and can be acknowledged before using the app.
- Daily notifications now rotate through 50 original motivational quotes. They do not include diary content. Notification permission remains user-controlled.
- Reminder delivery is checked while the app is open; this build does not claim reliable scheduled delivery while fully closed. Closed-app delivery needs a push service/server.
- Added an editable sticky-note block to the diary editor, with five pastel colours and persistence through the rich-text sanitizer.
- Cache version bumped to v22. Existing local storage/database keys are unchanged.

Validation performed: JavaScript syntax, JSON/manifest parsing, HTML structure checks and ZIP integrity. Physical iPhone/Android testing has not been performed.
