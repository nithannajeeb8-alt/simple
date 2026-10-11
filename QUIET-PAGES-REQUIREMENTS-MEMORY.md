# Quiet Pages: persistent project requirements

This file records the requirements discussed across Quiet Pages work so later updates don't silently drop features. Preserve it with the project.

## Product and design constraints
- Existing app is a static PWA hosted through GitHub Pages / Nithan.in; relative paths must work when hosted under a repository subpath.
- Preserve the established visual design unless the user explicitly asks for a redesign: calm Apple-inspired spacing, pastel gradients, organic/layered scrapbook diary cards, per-entry colours, text on the left and photo frame on the right only when a photo exists.
- Fixed bottom navigation: Diary, Companion, Calendar, Settings; floating + button positioned sensibly; safe-area spacing; 44px+ touch targets; adequate bottom content padding.
- Do not make unsolicited visual changes while improving AI/model behaviour.

## Diary/editor/data integrity
- Keep all existing diary data; never clear localStorage/IndexedDB as an update strategy.
- “Hello World” is a real entry, not disposable demo content.
- Preserve dates, theme/mood, gallery/photos, captions, autosave, Save page, calendar, and rich-text editing.
- Editor supports bold, italic, underline, headings, quotes, font families/sizes, highlights/text colours, inserting images between paragraphs and captions.
- Preserve export/import backup; restoring a backup may replace current data, so warn the user and encourage exporting first.
- No empty image column when an entry has no photo.

## Companion and memory
- Natural, chatty, supportive voice; avoid generic robotic answers. Answer general questions normally and use diary context when relevant, without dumping unrelated private entries.
- Companion knows Quiet Pages features, its creator Nithan, and hosting at Nithan.in.
- Welcome on entry, refresh appropriately based on time/recent entries/approved memories without accumulating duplicate welcome messages.
- Automatically capture useful, durable, non-sensitive memories where possible; let user edit/delete memories. The full diary remains the source of truth and should be searchable, not replaced by a tiny memory shelf.
- Do not show hidden reasoning or `<think>`, `<analysis>`, or similar tokens. Suppress reasoning while streaming, sanitize complete and incomplete blocks, sanitize stored/history messages, retry a malformed response once, then use a safe fallback.
- For Qwen3, use supported non-thinking generation settings when possible; do not assume prompt-only filtering fixes model behaviour.
- Serialize model requests so chat, greeting, and background memory extraction do not collide.

## AI model compatibility
- Discover actual models from the installed WebLLM runtime catalogue; do not invent support for a model merely because it exists on Hugging Face.
- Group supported compact models into Lite, Balanced and Advanced by approximate parameter size, while clearly stating these labels do not guarantee speed or fit.
- Candidate families: Qwen, Phi, Gemma, Llama, SmolLM, StableLM and Mistral, only if the active runtime catalogue supports them.
- Use WebGPU capability checks; retain diary functionality if AI is unavailable. Explain that model/runtime files are downloaded and first-time downloads can be large.
- Apple Foundation Models is a native Swift API and cannot be directly called by Safari JavaScript. Keep Apple integration in a separate native iOS project, never inside the PWA-only deployment archive. The user has separately chosen to explore a native iOS app for personal installation on iPhone 16, with Windows-only development constraints; building/signing requires a Mac/Xcode route or a cloud Mac.
- Transformers.js is an alternative web inference runtime, not a drop-in model catalogue for WebLLM. Any future runtime switch needs compatible model artifacts and testing.

## Privacy and honest claims
- Diary content, photos, chat and memories are stored in browser-local IndexedDB with localStorage fallback.
- Local storage is not encryption. Never claim the diary is encrypted unless actual encryption is implemented and verified.
- When a local model is loaded, inference happens in-browser; model/runtime assets are fetched from providers and the page may load fonts/icons.
- Be honest about what has been syntax-checked versus what has been tested on real iPhone Safari/Android hardware.

## Deployment and quality assurance
- Keep service worker cache version in sync with each relevant update and ensure stale JavaScript/CSS can refresh.
- Preserve static no-build workflow and relative URLs.
- Before deployment, export backup; syntax-check JavaScript; inspect ZIP contents; test entries/photos/editor/calendar/backup/companion/model loading on actual devices.
- User wants the complete prior requirements carried forward; don't omit established features to make a narrow fix easier.
