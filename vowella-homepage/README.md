# Vowella

Static site (HTML/CSS/vanilla JS). No build step, no dependencies.

## Deploy
Copy this folder next to your site, e.g. `nithan.in/vowella/` (all paths are relative).
Existing routes (`/`, `/S1`, etc.) are untouched.

## Add a template
Append an object to `js/templates.js`. The gallery, preview dialog and links render from it.
Only list features the invitation really has.

## Assets
`assets/couple.webp`, `bush.webp` are your supplied images (couple cropped to its alpha bounds, bush trimmed 6% on the right edge). Floral/butterfly accents come from the supplied sheet.
