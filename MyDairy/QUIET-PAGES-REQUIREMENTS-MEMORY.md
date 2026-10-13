# Quiet Pages requirements register

This file records the product constraints shared in the project conversation. Keep it with the project when handing work between sessions. It does not itself create persistent runtime memory.

## Preserve existing experience
- Quiet Pages is a local-first diary PWA currently hosted using GitHub Pages / Nithan.in.
- Do not redesign the existing scrapbook-card look, pastel/dynamic card colours, spacing, glassy navigation, diary/card layout, or overall visual theme when changing behaviour unless explicitly asked.
- Preserve existing entries, the real “Hello World” entry, date/theme/mood, photos, editor formatting, autosave, Save page, gallery, calendar, settings, bottom navigation and floating add button. Never clear local storage/IndexedDB as part of an update. Export a backup before deployments.
- The diary editor supports rich text, headings, bold/italic/underline, quotes, fonts/sizes, highlighting/text colour, inline image insertion and captions where currently implemented.

## Mobile writing UX
- While the keyboard is open, hide the Diary/Companion/Calendar/Settings navigation, floating add button and top navigation to free space. Restore them on dismiss.
- On iPhone, use a scroll-direction formatting toolbar: show when the user scrolls up a small accumulated distance, hide after deliberate downward scrolling, and keep its screen position stable while visible. Controls scroll horizontally.
- Keep the title/heading input visible and typeable when it has focus. Hide its row only while the body editor is focused, if needed for space.
- Do not continuously reposition the toolbar from VisualViewport events. Scroll direction controls visibility; the toolbar stays at a stable top-of-viewport position. Account for iOS Safari fixed-position quirks and validate on a physical device.
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


## Mobile editor keyboard accessory (v16)
- Formatting toolbar is portaled to a direct child of `document.body` while the editor is mounted, avoiding transformed/scrolling ancestor fixed-position bugs in iOS Safari.
- Toolbar accessory is removed when leaving the editor; keyboard CSS state and inset reset.
- Title input is not auto-focused during editor screen transition; title remains editable by explicit tap.
- No diary data/local-storage keys or visual theme tokens changed.

## Scroll-direction toolbar (v17)
- Initial body focus shows the toolbar at the top of the viewport. Accumulated upward scroll of about 9 px reveals it; downward movement of about 14 px hides it.
- Toolbar clicks reveal/retain it during formatting; a subsequent downward scroll hides it.
- Toolbar position is not continuously recalculated from keyboard viewport geometry.
- Verification is limited to source syntax and ZIP integrity; physical iPhone testing remains required.

## v18 editor and palette implementation
- Added Rose, Peach, Sand and Ocean while preserving Sky, Coral, Mint, Lavender and Dynamic.
- Added entry tags, caption fields for photos, mood emojis in calendar days, readable HTML export, and scrapbook divider/sparkle blocks.
- Android rich-text toolbar changes preserve selection before control interaction and do not dismiss toolbar on transient focus loss from native font/color controls.
- Five diary fonts use a first-online Cache Storage download workflow; font binaries are cached after successful fetch but are not physically embedded in the source archive. If offline on first launch before caching, system fallback fonts are used.
- Deploy only PWA files; no native iOS project is included. Do not clear local data or change IndexedDB/localStorage identifiers.


## v19 additions
- Print/Save as PDF via browser print dialog; never claim automatic PDF file save.
- Tap tag chips on cards to search by tag.
- More scrapbook sticker variants; bundled original local SVG theme/sticker resources.
- Paper-grain background texture and service worker precache entries.
- Bootstrap Icons and Google Fonts still have CDN first-use dependencies; fully bundled binary resources remain a follow-up because the build environment could not download external binaries.


## v19 additions
- Print/Save as PDF via browser print dialog; never claim automatic PDF file save.
- Tap tag chips on cards to search by tag.
- More scrapbook sticker variants; bundled original local SVG theme/sticker resources.
- Paper-grain background texture and service worker precache entries.
- Bootstrap Icons and Google Fonts still have CDN first-use dependencies; fully bundled binary resources remain a follow-up because the build environment could not download external binaries.


## Notifications (v21)
- Opt-in daily diary reminder with configurable local time.
- Test notification and permission status.
- Generic lock-screen-safe text, no diary details.
- Service-worker notification click returns to the app.
- Reminder checks run while app is open; closed-app scheduled delivery is not implemented because that requires push infrastructure.


## v22 completion notes
- Added first-entry privacy explainer. Accurate limitations: local storage is not encryption; runtime/model/fonts/icons can download from external providers; browser storage may be cleared.
- Added 50 original rotating motivational notification quotes. Notification body is generic and never includes diary text.
- Added editable scrapbook sticky notes (five pastel variants) in the rich editor, preserved by sanitization and autosave.
- PWA shell cache version: quiet-pages-shell-v22-privacy-quotes-sticky-notes.
- Reminder runtime remains foreground/open-app polling only; closed-app scheduled delivery needs server-backed Web Push.

## v23 final polish update (2026-10-13)
- PWA-only release; no native iOS project bundled.
- Replaced Bootstrap Icons CDN dependency with `assets/local-icons.js`, a local SVG icon renderer that supports existing `bi-*` icon classes and dynamically inserted icons.
- Removed Google Fonts stylesheet and runtime font binary downloads. System font stacks and local fallbacks now work offline; exact third-party typefaces are not bundled.
- Apple HIG-inspired accessibility/layout polish: 44pt minimum coarse-pointer buttons, safe area padding, visible focus, 16px form-control sizing, reduced motion, and high contrast support.
- Updated service worker cache name to v23 and precaches local icon renderer.
- Existing features preserved: diary CRUD, rich editor, photos/captions, stickers, editable sticky notes, themes, calendar, memory shelf, local companion, JSON backup/restore, HTML/PDF export, privacy welcome, 50 motivational quotes and foreground-checked notifications.
- Notification reminder limitations are disclosed: no reliable wake after fully closing PWA without push service/server. Do not claim closed-app reminders.
- Do not claim physical iPhone/Android testing unless performed.
