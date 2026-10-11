QUIET PAGES — PWA-ONLY MODEL CATALOGUE UPDATE

IMPORTANT: This archive contains ONLY the static website/PWA files. It deliberately does not contain a native iOS project. Do not upload a separate iOS project to the GitHub Pages site.

WHAT CHANGED
- Model discovery reads the current @mlc-ai/web-llm prebuiltAppConfig.model_list at runtime. It offers only model IDs supported by that installed runtime build.
- Compact model families are considered: Qwen, Phi, Gemma, Llama, SmolLM, StableLM and Mistral, if the runtime actually lists them.
- Available models are grouped into Lite (up to 1.5B), Balanced (over 1.5B through 3.5B), and Advanced (over 3.5B through 8B). These are rough size categories, not promises of performance or device memory fit.
- Existing Qwen3 non-thinking options and output filtering remain in place, along with retry/safe fallback behavior.
- Service-worker shell cache version bumped to refresh stale files.
- Existing design, diary/editor, photos, calendar, themes, backups, chat/memory, local storage and relative GitHub Pages paths are retained.

APPLE MODEL LIMITATION
Apple Foundation Models is a native Swift framework, not a browser API. A Safari PWA cannot call it directly. It is intentionally not shown as a selectable WebLLM model. A native iOS app would need a separate project and integration.

DEPLOY
1. Export a Quiet Pages backup from Settings before replacing files.
2. Extract this archive.
3. Copy the files at the archive root into the root of the existing GitHub Pages repository, replacing matching files. Do not delete unrelated existing repository files.
4. Commit/push and wait for Pages deployment. Reopen the app and allow the service worker to refresh.
5. Test: existing entries/photos still appear; create/edit/save an entry; check backup; open Companion; discover models; load a small model; send a general question and a diary-context question; confirm no <think> content is displayed.

PRIVACY
Diary entries, photos, messages and saved memories are stored locally in browser IndexedDB with localStorage fallback. Local storage is not encryption. When a compatible local model is loaded, inference is performed in the browser; runtime and model assets are downloaded from their providers. External fonts/icons may also be requested. Do not describe this as encrypted or claim that the app makes no external requests.

VALIDATION
JavaScript syntax is checked before packaging. Real device/runtime checks are still required on iPhone Safari and Android; model availability and performance depend on browser, WebGPU implementation, memory, runtime catalogue, and the exact model.
