# Quiet Pages

A private, mobile-first diary Progressive Web App with a local memory system and an optional on-device AI companion. This version deliberately uses **plain HTML, CSS, and JavaScript**. There is no build process, no `npm install`, and no frontend framework whose missing module can strand the page on a boot screen.

## Features

- Diary home with overlapping editorial entry cards and a floating create button.
- Create, edit, autosave, and delete entries; date, mood, per-entry theme, multiple photos, and cover-photo selection.
- Immersive entry reading page with photo gallery and a separate optional reflection.
- Diary, Companion, Calendar, Settings navigation.
- Sky, Coral, Mint, Lavender, and Dynamic themes. Dynamic chooses a deterministic palette for the current date, so it does not change each time the app opens.
- Browser-local storage: IndexedDB first, with localStorage as a limited fallback.
- Personal memory shelf with add/edit/delete.
- Keyword retrieval from diary entries; an explicit fallback response works even without a language model.
- Optional WebLLM integration. It loads the WebLLM runtime only after the user requests model discovery, then lists small models from the runtime's actual `prebuiltAppConfig.model_list`. A model is offered only if that runtime lists it. It does **not** assume Qwen3 1.7B is supported.
- JSON backup/restore including images; local-data deletion.
- Responsive layout, keyboard labels, reduced motion, text-size options, and iPhone safe-area padding.
- PWA manifest, SVG app icon, service-worker app-shell cache, and GitHub Pages workflow.
- Bootstrap Icons and Google Fonts loaded from CDNs, with system font fallbacks. Diary functions do not depend on those CDNs.

## Project files

- `index.html` — app markup and external UI resource links
- `styles.css` — design system and responsive layouts
- `app.js` — app state, IndexedDB, diary, calendar, memory retrieval, backups, and optional AI
- `manifest.webmanifest` — installable PWA metadata
- `sw.js` — best-effort app-shell offline cache; it does not cache diary data
- `icons/icon.svg`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png` — install icons
- `.github/workflows/deploy.yml` — deploys the repository root to GitHub Pages on pushes to `main`
- `.nojekyll` — disables Jekyll processing for static files

## Deploy to GitHub Pages

1. Download and extract the project ZIP. Make sure `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js`, `icons/`, and `.github/` are at the **repository root**, not inside an extra nested `quiet-pages` folder.
2. Upload/commit all files to your GitHub repository's `main` branch. If your default branch has another name, edit `.github/workflows/deploy.yml` to match it.
3. In the repository, open **Settings → Pages** and set the build/deployment source to **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy Quiet Pages to GitHub Pages** to finish. The published site URL will appear in the deployment job.
5. Open the HTTPS URL on the phone. On iPhone, open it in Safari, tap **Share**, then **Add to Home Screen**. On Android, use the browser's **Install app** option when available.

Because all paths are relative, this supports both a user site and a project site such as `https://username.github.io/repository/`.

## Running locally

For basic visual use, open `index.html` in a modern browser. Browser storage may work, but service workers, installability, and WebGPU model loading generally require HTTPS or localhost. For a local server, run one of these in this folder:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Local AI model setup

1. Open the deployed HTTPS app and go to **Settings → Your local companion**.
2. Tap **Find compatible models**. This downloads/loads the WebLLM runtime code from `esm.run` and checks its advertised prebuilt model list.
3. Choose a supported small model, then tap **Download & load**. The first download may be large; keep the app open and on a stable connection.
4. After loading, prompts are passed to the model running in this browser. Diary excerpts and approved memory facts are retrieved locally and placed in the prompt. Model weight downloads are served by the model providers, not by the diary app's own server.

This project does **not** promise that Qwen3 1.7B is in WebLLM's catalogue. The model selection is based on the runtime's own model list. On devices without WebGPU, with low memory, or with unsupported browsers, use the diary and keyword-based companion fallback. Actual model availability and performance must be tested on target devices.

## Privacy and data safety

- There is no diary backend and no account.
- Entries, memory facts, chat history, and resized photos are saved to browser storage on the device.
- The optional model runtime is fetched from a third-party CDN after you ask to find models; model weights are downloaded from the configured model host. Local inference means prompts are not sent to a hosted inference API by this app.
- External Google Fonts and Bootstrap Icons may contact their CDNs when the page loads online. The app has font fallbacks and does not require those icons to work.
- Browser storage can be cleared or evicted. Use **Settings → Export a backup** regularly. Store backups somewhere secure; they can contain sensitive diary entries and photos.
- Import replaces the current app data after confirmation. Export a backup before restoring a previous one.
- App lock and dependable background notifications are not included in this version.

## Notes / limitations

- This is a working static implementation, but it still requires real-device testing before relying on it for important diary data.
- On iPhone, file download UI varies by iOS version. Use the share/download sheet to save exported JSON to Files.
- The first full backup can be large when it contains many photos.
- The service worker caches the app shell only; user data is in IndexedDB and is not part of the cache.
- The model engine is session-loaded. WebLLM may cache weights between sessions, but cache persistence depends on browser storage policy. The app intentionally does not automatically load a large model at page startup.
