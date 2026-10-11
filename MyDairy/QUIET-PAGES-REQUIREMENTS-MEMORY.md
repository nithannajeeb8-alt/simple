# Quiet Pages requirements register

This file records the product constraints shared in the project conversation. Keep it with the project when handing work between sessions. It does not itself create persistent runtime memory.

## Preserve existing experience
- Quiet Pages is a local-first diary PWA currently hosted using GitHub Pages / Nithan.in.
- Do not redesign the existing scrapbook-card look, pastel/dynamic card colours, spacing, glassy navigation, diary/card layout, or overall visual theme when changing behaviour unless explicitly asked.
- Preserve existing entries, the real “Hello World” entry, date/theme/mood, photos, editor formatting, autosave, Save page, gallery, calendar, settings, bottom navigation and floating add button. Never clear local storage/IndexedDB as part of an update. Export a backup before deployments.
- The diary editor supports rich text, headings, bold/italic/underline, quotes, fonts/sizes, highlighting/text colour, inline image insertion and captions where currently implemented.

## Mobile writing UX
- While the keyboard is open, hide the Diary/Companion/Calendar/Settings navigation, floating add button and top navigation to free space. Restore them on dismiss.
- On iPhone, keep formatting controls within easy reach immediately above the software keyboard. Controls should scroll horizontally rather than requiring the user to scroll to the top of a long entry.
- Keep the title/heading input visible and typeable when it has focus. Hide its row only while the body editor is focused, if needed for space.
- Keep the toolbar in the visible viewport during long body scrolling and keyboard viewport changes; reset positioning when the keyboard closes. Account for iOS Safari VisualViewport quirks.
- Do not break body selection/range when tapping toolbar controls. Use touch-friendly targets and safe-area-aware styling.

## AI companion and models
- Natural, supportive, chatty companion; answer general questions generally and use diary context when helpful, without forcing every answer to be diary-related. Know app facts accurately (created by Nithan, hosted at Nithan.in).
- Never expose reasoning or `<think>` blocks. Sanitize both final/streamed output and history; retry/fallback safely if the model returns reasoning only.
- Store diary and memory data locally; do not claim encryption unless implemented. Be accurate about model downloads/runtime provider requests and where diary context is processed.
- Diary remains the source of truth; memory shelf supplements it. Search diary entries when relevant; do not claim semantic/complete retrieval unless actually implemented and tested. Useful memory capture should be safe and controllable.
- PWA model options should only offer model IDs supported by the active runtime. Investigate Qwen/Phi/Gemma/Llama/SmolLM/Mistral only where runtime catalogue confirms them. Lightweight, balanced and larger options are recommendations, not guarantees across devices.
- Apple Foundation Models requires a native iOS integration; do not show it as a PWA model option that Safari cannot call directly. Keep a native iOS project separate from the PWA deployment ZIP.

## Delivery discipline
- Package PWA overlays without a native iOS project. Preserve unrelated files/assets. Use a new service-worker cache version when deployed JS/CSS changes.
- Say what was actually syntax/package tested; do not claim physical iPhone/Android testing unless it happened.
