# Vowella homepage

A responsive, editorial-style landing page for Vowella, the wedding invitation website project. Built with plain HTML, CSS and JavaScript so it can be hosted on GitHub Pages or another static host without a build step.

## Preview locally

1. Unzip the folder.
2. Open `index.html` in a modern browser. For the most reliable local preview, open a terminal in this folder and run:

   ```bash
   python -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

There are no npm dependencies or build tools.

## Files

- `index.html` — page content, sections, links and invitation preview.
- `styles.css` — visual system, responsive layouts, cover-flow styling and animations.
- `script.js` — navigation toggle, on-scroll reveals, year and the interactive cover flow.
- `favicon.svg` — Vowella monogram.
- `assets/` — the supplied art and the isolated transparent couple cut-out used in the opening scene.

The custom font families load from Google Fonts. The page still works with system font fallbacks if the visitor is offline, though typography will vary slightly.

## Live invitation

The live preview CTA points to the existing invitation at [https://nithan.in/S1](https://nithan.in/S1). The adjacent cover-flow pieces are deliberately marked **In the making** and are not presented as published templates.

## Deploy

Upload the contents of this folder to a static host. If publishing to GitHub Pages, keep `index.html` at the published root, and keep `styles.css`, `script.js`, `favicon.svg` and `assets/` alongside it. All bundled image paths are relative, so the page can live in a repository subfolder as well.

## Notes

- The hero uses the provided hedge image as a blurred, darkened background and the supplied couple artwork as a transparent foreground layer.
- The couple cut-out is a derivative prepared from the supplied couple image for the hero; the original image is retained and used in the invitation preview.
- The animated reveal checks `prefers-reduced-motion` and is toned down for visitors who request less motion.
- Contact links point to Nithan's existing website rather than inventing an email address or a contact form that is not connected to a backend.
