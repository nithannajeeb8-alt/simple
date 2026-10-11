# Quiet Pages

A private, installable diary PWA with four main sections: Diary, Companion, Calendar, and Settings. It uses IndexedDB for local diary data, Lucide icons, Google Fonts with system fallbacks, and an optional WebGPU-powered local language model.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Local AI requires a secure context (HTTPS or localhost), WebGPU support, enough memory, and a model supported by the installed WebLLM package. The app does not silently download a model.

## Deploy to GitHub Pages

1. Upload the contents of this folder to a GitHub repository.
2. Use the `main` branch.
3. In **Settings → Pages**, select **GitHub Actions** as the source.
4. Push to `main` or run the workflow manually under **Actions**.

The workflow builds the app with a repository-aware base path. For a repository named `username.github.io`, it deploys at the domain root; other repositories deploy under `/<repository-name>/`.

## Local AI notes

The app tries to use a supported Qwen3 1.7B model from WebLLM's prebuilt catalogue, then a 0.6B fallback if one is available in the installed runtime. WebLLM cannot load arbitrary model weights merely because a model exists on Hugging Face; it needs a compatible prebuilt model configuration and compiled assets. Browser/device support varies, especially on iOS. If the model cannot load, diary features continue to work and the Companion uses a transparent local-record fallback instead of inventing AI answers.

## Privacy and backups

Diary content, photos, and memory records are stored in the browser's IndexedDB by default. Use **Settings → Export a full backup** regularly. Clearing browser/site data can remove local entries. The local AI model is downloaded only after the user presses the enable button. Fonts and app source may be fetched from external hosts on first load; the service worker caches same-origin app assets for offline use.

## UI resources

- [Lucide icons](https://lucide.dev/) via the `lucide` package
- [Google Fonts](https://fonts.google.com/) with local system fallbacks
