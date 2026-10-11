QUIET PAGES — COMPANION UPDATE

This package preserves the current visual design. styles.css, index.html, and manifest.webmanifest are unchanged from the supplied current build. The functional changes are in app.js; sw.js only changes the app-shell cache version.

Improvements:
- Companion voice is warm, chatty, supportive, and answers general questions normally.
- Built-in facts cover Quiet Pages, Nithan, Nithan.in, features, backups, and accurate local-storage privacy details.
- Personal questions retrieve relevant diary entries; unrelated general conversation does not dump diary excerpts.
- Durable, non-sensitive facts can be added automatically to the memory shelf from saved diary pages and chat messages; the owner can edit/delete those memories.
- A single welcome message refreshes on app launch without accumulating duplicates.
- Old assistant messages that contain visible reasoning/internal narration are filtered on load/render and excluded from model history.
- Qwen3 receives non-thinking mode settings; malformed outputs are retried once and never deliberately displayed as process notes.
- Local model calls are serialized to reduce collisions between chat, greeting, and background memory extraction.

Privacy notes: diary data and conversation state are stored in browser-local IndexedDB, with localStorage fallback. Local storage is not encryption. The site may request external font/icon assets and the WebLLM runtime/model files are fetched from their providers.

DEPLOYMENT:
1. Keep a backup of the current project and export a Quiet Pages JSON backup before replacing files.
2. Replace app.js and sw.js. All other bundled files are included only to make a complete, consistent package; index.html, styles.css, and manifest.webmanifest are unchanged.
3. Preserve filenames and relative paths. Wait for GitHub Pages to deploy, then reload/reopen the site.
4. Test one new chat turn, ask who created Quiet Pages, ask a personal diary question, save a harmless preference in a diary entry, and check the memory shelf.

Limitations: local model behaviour cannot be guaranteed on every model/runtime. If it generates malformed reasoning, output filtering suppresses it and asks the model once more. Automatic memory only saves durable, non-sensitive details; the entire diary remains the searchable source of truth.


FOLLOW-UP FIX (v11)
- The visible chat sanitizer now removes complete <think>, <analysis>, and <reasoning> blocks, including HTML-escaped variants.
- If a reasoning block is unfinished, it is discarded rather than displayed.
- Assistant messages are sanitized when rendered and when persisted data is normalized.
- The service worker uses a new cache version and network-first fetching for app.js and styles.css to reduce stale-code problems.
- Added Apple-inspired spacing refinements to chat bubbles, suggestion chips, text input, navigation, and floating add button while retaining the current design language.
- Verified with Node syntax checks and focused sanitizer tests. Live iPhone Safari / WebLLM testing is still required.

MOBILE EDITOR UX UPDATE (v12)
- On small screens, focusing the diary title/body enters a keyboard-aware writing mode.
- Main navigation, floating add button, top brand bar and editor intro are hidden while the keyboard is open to reclaim vertical space.
- Rich formatting toolbar remains sticky, horizontally scrollable and uses 42px touch targets.
- Uses VisualViewport resize/scroll events with a focus-state fallback; it does not rely on the limited VirtualKeyboard API.
- Existing diary storage schema and saved entries are not cleared or migrated.
- This was syntax/packaging checked in a desktop environment; still test in Safari on the actual iPhone because keyboard behaviour varies by iOS release.
