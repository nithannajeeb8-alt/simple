# Quiet Pages local resource pack (v19)

- `assets/themes/`: locally bundled paper grain and decorative theme backdrops.
- `assets/stickers/`: original SVG scrapbook stickers created for Quiet Pages.
- Existing icon glyphs in the UI still use Bootstrap Icons via jsDelivr CDN; this package does not claim that the Bootstrap icon font is bundled offline.
- Typography is loaded from Google Fonts on first use and cached by the app where supported; font binary files are not included in this ZIP because network download was unavailable in the build environment.

## Online resource references
- Lucide icon library and ISC license: https://github.com/lucide-icons/lucide
- Google Fonts: https://fonts.google.com/
- Bootstrap Icons: https://icons.getbootstrap.com/
- MDN PWA caching guide: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching

For a fully offline resource pack, download and bundle the desired font binaries and icon CSS/font files, then add them to the service worker shell list. Do not load these assets from a third-party CDN at runtime if strict offline availability is required.
