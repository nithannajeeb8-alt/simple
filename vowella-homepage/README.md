# Vowella homepage

A responsive, editorial-style landing page for Vowella, the wedding-invitation website project. Built with plain HTML, CSS and JavaScript so it can be hosted on GitHub Pages or another static host without a build step.

## Preview locally

1. Extract the ZIP.
2. Open a terminal in the `vowella-homepage` folder.
3. Run `python -m http.server 8000`.
4. Visit `http://localhost:8000`.

There are no npm dependencies or build tools.

## Project files

- `index.html` — page content, section structure and invitation preview.
- `styles.css` — responsive visual system, typography, cover-flow depth and subtle motion.
- `script.js` — menu toggle, scroll reveals, cover-flow controls, swipe gestures and current year.
- `favicon.svg` — Vowella monogram.
- `assets/` — original supplied images, the hero couple cut-out, a transparent bouquet companion, and a tightly cropped transparent butterfly for clean overlays.

The custom fonts load from Google Fonts. If a visitor is offline, the page falls back to installed serif and sans-serif fonts.

## Invitation status

The only live invitation shown is **Aarav & Meera / S1**, linked at <https://nithan.in/S1>. The two flanking gallery designs are design directions marked **In the making**, not live templates.

## Deploy to GitHub Pages

Upload the contents of this folder to the repository's published root (or keep the folder as a subdirectory if your Pages path points there). Keep `index.html`, `styles.css`, `script.js`, `favicon.svg` and `assets/` together. Image paths are relative, so no server framework is required.

## Motion and interactions

- The cover flow supports the previous/next controls, pagination dots, left/right keyboard arrows, Home/End keys and horizontal swipes on touch screens.
- The cover flow is intentionally limited to one live invitation, with future designs visibly labelled.
- Intro and asset movement respects `prefers-reduced-motion`; the important content is still visible when animations are reduced.
- Contact links lead to the creator's existing site rather than inventing an email address or pretending a backend-connected form exists.
