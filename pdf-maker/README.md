# PageBloom · PDF Studio

A colorful, mobile-friendly PDF maker built with plain HTML, CSS and JavaScript. It has **no npm dependencies**, no API keys, and no server-side processing. Image files are read and processed locally in the browser.

## Features

- Import multiple images by file picker or drag-and-drop; camera capture is offered on supported phones.
- Reorder pages by dragging their cards.
- Rotate, remove and select individual pages.
- Adjust brightness and contrast per page.
- Export to A4, US Letter, A5 or a page sized to the image.
- Portrait/landscape orientation, margins, fit/fill/stretch, image quality and optional page numbers.
- Preview the generated PDF before downloading.
- PWA manifest and offline app-shell cache for HTTPS deployment.
- Pastel red, blue, yellow, green, purple and peach design sections.

## Run on Windows

### Fastest way

1. Extract the project ZIP to a folder.
2. Open the folder and double-click `index.html`.
3. The image-import and PDF-generation workflow should work in a current version of Chrome, Edge, Firefox or Safari. **PWA installation and service-worker caching do not work from a `file://` URL.**

### Run on localhost (recommended for testing the PWA shell)

1. Install Python 3 from <https://www.python.org/downloads/windows/> if it is not already installed.
2. Double-click `run-local.bat`.
3. Open <http://localhost:8080> in your browser.
4. Keep the terminal window open while testing.

No `npm install` is required.

## Install on a phone

The app must be hosted on an HTTPS website for dependable PWA installation. Localhost works for development on the computer itself, but a phone cannot use the computer's `localhost` as the computer's address.

1. Upload the contents of this folder to a static HTTPS host, such as GitHub Pages, Cloudflare Pages or a static deployment on Vercel.
2. Open the deployed URL on the phone.
3. **iPhone:** open in Safari, tap Share, then **Add to Home Screen**. Depending on the iOS version, confirm the installation in the next screen.
4. **Android:** open in Chrome, open the menu, then select **Install app** or **Add to Home screen**.

The `manifest.json`, app icons and `sw.js` are included. PDF creation uses browser canvas and a small in-project PDF writer, so PDF generation itself does not need an internet connection once the app's files are available.

## Limitations of this first version

- Pages are imported as images, not editable text documents. It does not perform OCR.
- Image adjustments are brightness and contrast; there is no freeform crop tool yet.
- PDF contents are raster images, so the text inside a photograph or scan is not selectable/searchable.
- Very large images are downscaled to a print-friendly working size to reduce browser memory use.
- Camera capture behavior depends on the device and browser. The camera button may instead open the system image picker on some devices.
- Offline caching is best-effort. A new deployment version may need the service worker cache to update.

## Project files

- `index.html` — application structure and controls
- `styles.css` — responsive pastel design system
- `app.js` — image management, interactions, and PDF writing
- `manifest.json` — PWA metadata
- `sw.js` — app-shell caching
- `icons/` — home-screen icons
- `run-local.bat` — optional Windows localhost launcher

## Troubleshooting

- If an image fails to import, try a JPG or PNG export. Browser support for HEIC/HEIF varies.
- If a PDF is unusually large or the browser runs out of memory, reduce the export quality or split the images into smaller batches.
- If the app does not install from a hosted URL, check that the site uses HTTPS and that `manifest.json`, the icons and `sw.js` are reachable from the deployed path.
