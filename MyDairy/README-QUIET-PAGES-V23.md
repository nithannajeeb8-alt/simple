# Quiet Pages v23 — final polish release

A mobile-first, local-first diary PWA for iPhone Safari, Android browsers, and desktop browsers. This release retains the v22 diary, companion, memories, calendar, themes, rich-text editor, photos, editable sticky notes, stickers, backup/restore, PDF/HTML export, privacy welcome, and motivational quote reminders.

## Final changes

- Replaced the remote Bootstrap Icons font dependency with a local inline SVG icon set at `assets/local-icons.js`. It transforms the app's existing icon class names, including icons created later by dynamic diary/editor rendering.
- Removed Google Fonts stylesheet links and runtime font downloads. Typography now uses native system stacks and local fallbacks, which reduce third-party requests and improve offline consistency. Named decorative font choices fall back to available system serif/rounded/cursive styles; exact third-party font appearance is not promised.
- Bumped the service-worker shell cache to v23 and precaches the local icon script.
- Applied Apple Human Interface Guidelines-inspired polish: safe-area-aware layout, 44-point touch targets on coarse pointers, clearer focus outlines, larger form controls, reduced-motion support, and stronger-contrast adjustments.
- Improved the notification test action when the browser does not support the Notifications API.

## Online references and licensing

- Apple Human Interface Guidelines, including accessibility, control sizing, contrast, and adaptable interfaces: https://developer.apple.com/design/human-interface-guidelines/ and https://developer.apple.com/design/human-interface-guidelines/accessibility
- Lucide icon library as a reference for consistent, legible, stroke-based icon design: https://lucide.dev/ and https://github.com/lucide-icons/lucide

The SVGs in this release are locally authored equivalents, not copied Lucide assets. The build environment could not resolve external hosts during packaging, so third-party font/icon binaries were not downloaded. No icon/font CDN is required for the interface now.

## Important limits

- Diary entries, photos, memories, and chat history stay in browser storage by default. There is no app-owned diary-sync backend. Browser storage is not encryption and may be cleared; export backups regularly.
- Optional WebLLM runtime/model downloads are only initiated when the user asks to discover/load a model. Availability depends on browser, WebGPU, memory, and the runtime's current catalogue.
- Motivational reminders use general quotes, never diary text. This static PWA can check reminders while open, but cannot reliably wake itself after being fully closed. Reliable closed-app web push requires a push service/server and an explicit privacy decision.
- iOS and browser-specific behavior still needs physical-device testing. Automated syntax/structure checks are not a substitute for testing on a real iPhone and Android device.

## Deploy

1. Export a backup from Quiet Pages Settings before replacing files.
2. Extract the ZIP so `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `assets/`, `icons/`, and `.github/` are at repository root.
3. Commit the files to the repository's deployment branch and wait for GitHub Pages deployment.
4. Open the HTTPS site. On iPhone, use Safari → Share → Add to Home Screen. On Android, use the browser's Install app option.
5. If an old UI persists, fully close and reopen the installed app. The service worker uses a new v23 cache name, which should replace the previous shell cache on activation.
