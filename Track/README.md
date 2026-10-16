# Mind Atlas · Personal Intelligence Workspace

Mind Atlas is a local-first personal knowledge workspace and installable PWA prototype. Its aim is to connect notes, projects, learning, intentions, and evolving ideas into an evidence-backed personal knowledge map.

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Create a production bundle with `npm run build`, then serve the `dist/` folder over HTTPS or localhost. A static host such as GitHub Pages can host the built app. For an iPhone, open the HTTPS URL in Safari and use Share → Add to Home Screen.

## Currently implemented in this prototype

- Create, edit, delete, search, and subject-organize notes.
- Local browser persistence and revision snapshots when notes are edited.
- JSON workspace export/import and explicit clear-data control.
- Subject activity overview and a basic subject map.
- Rule-based discoveries and possible intention extraction with source-note links.
- Optional editor-event statistics while typing analysis is enabled.
- PDF text extraction and image OCR paths using PDF.js and Tesseract.js.
- Optional Transformers.js embedding similarity, loaded on demand.
- Explicit goal tracking and manually created recall prompts with self-ratings.
- Browser diagnostics, component preference screen, responsive navigation, PWA manifest and service worker.

## Important: prototype, not a verified release

The code includes a working foundation, but this archive does **not** claim every feature in `MIND-ATLAS-ROADMAP.md` is complete. The roadmap labels implemented, partial, and planned capabilities. In particular, the app still needs a verified production build and end-to-end tests in a real browser. The component screen records preferences; it is not a secure dynamic package installer. Some dependencies and model weights load only when the corresponding feature is used.

## Data and privacy

- Notes are stored in the current browser's local storage in this prototype. They are not automatically synced between devices.
- Export backups regularly. Clearing browser/site data can erase the workspace; browser storage can be evicted.
- A first model/component download requires internet. The app shell may work offline after successful caching, but offline model and document workflows need device testing.
- PDF/OCR and semantic features may fetch JavaScript/model assets. Do not describe this app as fully offline or network-free until network requests are audited and verified.
- Editor analysis is opt-in and observes only events in this app. A PWA cannot read WhatsApp, system-wide typing, or other apps' activity.
- Typing pauses are weak signals and must not be treated as evidence of emotions, diagnoses, or personality.

## Technology references

- Transformers.js: https://github.com/huggingface/transformers.js
- Graphology: https://github.com/graphology/graphology
- Compromise: https://github.com/spencermountain/compromise
- PDF.js: https://github.com/mozilla/pdf.js
- Tesseract.js: https://github.com/naptha/tesseract.js
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Service workers: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines

The references are intended technology options, not a claim that every library is currently integrated into every feature.
