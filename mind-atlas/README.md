# Mind Atlas v1

A first functional, local-first PWA variant with a premium dark/amber interface.

## Included in this build

- Create, edit and delete notes
- Search notes by title, content or subject
- Local browser persistence
- JSON export and import
- Subject overview, activity timeline and basic subject graph
- Progress summaries based on real saved notes
- Component manager and actual browser capability checks
- Optional editor-activity preference (currently a setting only; detailed keystroke telemetry is not implemented)
- PWA manifest and service worker shell cache
- npm dependency declarations for:
  - `@huggingface/transformers`
  - `graphology`
  - `compromise`
  - `pdfjs-dist`
  - `tesseract.js`

## Run locally

Requires Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To build:

```bash
npm run build
npm run preview
```

If npm is blocked on your network, install dependencies on a network that permits npm, then transfer the project and lockfile.

## Important implementation status

This is the first working application variant, not the finished intelligence engine. Package names are declared in `package.json`; the application does not yet dynamically import or execute those packages. The component manager deliberately says this rather than falsely claiming a library or model is installed.

- PDF.js integration still needs a PDF import/viewer workflow.
- Tesseract.js integration still needs OCR UI and worker/model configuration.
- Transformers.js integration still needs a selected model, verified model source, download consent, caching, and inference code.
- Graphology integration still needs graph construction/analysis based on note relationships.
- Compromise integration still needs extraction pipeline and tests.
- Current subject graph is a transparent, basic map, not a semantic AI graph.
- Notes are stored in browser `localStorage` in this starter. For larger files and production use, migrate to IndexedDB and add storage quota handling.
- Google Fonts are loaded externally; remove the import if fully offline/self-contained fonts are required.
- Service worker only caches the app shell. It does not cache external packages or model weights.

## Privacy

Data entered in the prototype is stored in this browser's local storage. Export regular backups. Browser storage may be cleared by the user or browser. Do not use shared/public devices for private notes. Before release, review all network requests and write a privacy notice that matches actual implementation.
