# Mind Atlas: Complete Product Specification and Roadmap

This document consolidates the product requirements discussed for Mind Atlas. It is the source of truth for the intended full product, not a statement that every requirement is already implemented.

## Product principle

Build a private, evolving knowledge system that helps a person remember what they wrote, connect ideas, follow through on goals, and evaluate what they actually learn. Findings must be explainable, editable, reversible, and grounded in source material. Never invent memories or confidence scores.

## Experience and visual design

- Premium, minimal iOS-inspired interface: near-black surfaces, subtle warm-brown gradients, restrained amber accents, charcoal cards, soft shadows, spacious layouts, clear SF-like typography.
- Mobile-first responsive layouts for iPhone and desktop; consistent iconography and touch targets.
- Bottom navigation on mobile and sidebar navigation on larger screens.
- Sections: Overview, Library, Knowledge Graph, Progress, Discoveries, Components/Setup, Settings.
- Note editor supports clear formatting, links, nested threads, image/file attachments, and visible save state.
- Motion is subtle and respects `prefers-reduced-motion`; no anxiety-inducing dashboards or fake progress meters.
- Accessible contrast, keyboard navigation, readable text scaling, useful empty/loading/error states.

## 1. Knowledge workspace

- Create/edit/delete notes; rich text; subjects/tags; search and filtering; favorites and recent activity.
- Nested threads and subthreads, cross-links between notes, projects, subjects, people, and events.
- Revision history with diff/restore, timestamps, and source metadata.
- Calendar/timeline views; attachments for photos and supported files.
- PDF text extraction, OCR for images/scans, document metadata and page/source references.
- Import/export with backup validation and recovery. Large content should migrate from localStorage to IndexedDB.

## 2. Persistent personal memory

- Maintain an evolving profile from explicitly saved notes and permitted imports only.
- Capture recurring interests, preferences, ongoing projects, goals, decisions, people/events, and unresolved questions.
- Link every memory to one or more source notes and timestamps.
- Merge duplicate memories cautiously; preserve conflicting statements rather than silently overwriting history.
- Allow users to confirm, correct, dismiss, edit, or delete memories.
- Maintain temporal history so the system can show how an idea changes rather than flattening it into a permanent label.
- Never infer sensitive attributes or present speculative psychological conclusions as facts.

## 3. Discoveries and cross-note connections

- Identify recurring topics and terms, related ideas, repeated questions, unresolved problems, and connections between projects.
- Semantic search and related-note retrieval using local embeddings where practical.
- Show the supporting notes, dates, matching concepts, method, and confidence/limitations for every finding.
- Distinguish exact text matches, rule-based patterns, and embedding similarity.
- Provide feedback controls: useful, incorrect, dismiss, and correction. Feedback must influence future ranking only through a documented, testable rule.
- Detect contradictions and evolving perspectives only when the source passages support that interpretation.
- Avoid duplicate, circular, or meaningless graph edges.

## 4. Intentions and follow-through

- Detect phrases such as “I want to”, “I plan to”, “I should”, “I will”, “I could”, and explicit goal statements.
- Treat extracted phrases as candidates, not confirmed goals. Link them to their source note.
- Let the user confirm, edit, set a due date, mark completed, pause, or dismiss.
- Track intention-to-action outcomes over time, including unfinished or repeatedly postponed projects.
- Separate explicitly stated intentions from system-generated suggestions.

## 5. Writing-session observations

- Optional, clearly consented analysis inside Mind Atlas's own editor only.
- Session duration, input event counts, pauses, deletions/corrections, revision changes, and writing-rate estimates.
- Compare revisions and identify repeated rewrites or recurring topics.
- Explain that pauses and typing speed are noisy context-dependent signals. Never infer mood, deception, diagnosis, or personality from them.
- No monitoring of other apps, system keyboard use, private messaging, or phone-wide activity. A normal PWA does not have those permissions.

## 6. Learning and knowledge development

- Subject maps with topics and subtopics; distinguish recorded coverage from demonstrated understanding.
- User-created recall prompts and self-assessments; future spaced-repetition scheduling.
- Track recall outcomes at different times and identify concepts that need another review.
- Record application evidence such as exercises, projects, explanations, and decisions.
- Any mastery estimate must cite evidence and describe its method. Note count and word count alone are not mastery.
- Show gaps and suggested next steps without pretending to know a person's competence from their notes alone.

## 7. Predictions and adaptive suggestions

- Suggest likely next interests, useful connections, or next actions based on documented past activity and stated goals.
- Store each prediction with its timestamp, rationale, evidence, and confidence/uncertainty before the outcome is known.
- Let users record whether the prediction was relevant or what happened later.
- Evaluate calibration and accuracy over time; do not claim accuracy until there is enough outcome data.
- Offer alternatives and avoid manipulative, overconfident, or psychological claims.

## 8. Knowledge graph

- Interactive nodes for notes, subjects, projects, goals, people/events where user-entered, and concepts.
- Edges are typed (same subject, explicit link, keyword overlap, semantic similarity, user confirmed).
- Filter by date/type/subject; zoom, pan, select, and open source notes.
- Explain edge provenance and avoid presenting similarity as truth.
- Use Graphology for graph algorithms only after integration, version and bundle checks.

## 9. AI and components

- Optional Transformers.js embeddings or compact inference models; defer downloads until user requests them.
- PDF.js and Tesseract.js for document text/OCR, with model/worker sizes and network requirements disclosed.
- Compromise or another NLP tool for rule-based extraction; Graphology for graph structures.
- Component manager must report actual installed/available state, version, integrity, size, download progress, failures, and retry/removal actions. A preference toggle must never pretend to install a package.
- Keep expensive work in Web Workers where appropriate; handle cancellation, memory limits, and errors on mobile.
- Audit dependencies, licenses, advisories, and network endpoints; pin versions and set an appropriate CSP.

## 10. Local-first storage and privacy

- Move primary records to IndexedDB with schema versioning and migrations.
- Explicitly document every network request and whether note content leaves the device.
- Make remote AI an explicit opt-in, separate from local analysis.
- Export and restore notes, revisions, graph edges, goals, recall history, memories, feedback, and settings.
- Validate imports, support duplicate handling, and warn before replacement.
- Provide selective deletion and full workspace deletion; ensure derived indexes and cached personal data are also cleared.
- Add backup reminders and recovery tests. Browser storage is not a guaranteed permanent archive.

## 11. Onboarding and component setup

1. Privacy/consent explanation: what is stored locally, what may be fetched, and what is never monitored.
2. Required versus optional components with real package/model sizes and actual progress.
3. Browser capability and storage diagnostics, with clear limitations rather than fake device specs.
4. Initialize storage and offer blank workspace, validated import, or clearly labeled sample data.
5. Optional model downloads only after informed user action; show cancel/retry states.
6. Brief skippable onboarding and reduced-motion support.

## 12. Platform and release

- PWA install flow for iPhone Safari and desktop browsers.
- Offline app-shell caching, IndexedDB persistence, graceful online/offline status, and recovery from interrupted writes.
- Explain that initial app assets and optional models require a network connection; test which functions actually work offline.
- Responsive UI and performance testing on iPhone-class memory constraints.
- Automated tests for CRUD, import/export, migrations, note linking, goal lifecycle, recall lifecycle, deletion, and insight evidence.
- End-to-end tests for PDF, OCR, embeddings, offline restart, and real-device PWA installation.
- Production build must pass, console errors must be reviewed, and dependencies must be audited before calling the archive a release.

## Current prototype status (as of this archive)

### Implemented/basic
- Note CRUD, search, subjects, browser-local persistence, revision snapshots.
- Basic subject graph and activity dashboard.
- Rule-based recurring-topic and intention suggestions with source-note links.
- Optional editor-event counters; JSON import/export; browser diagnostics.
- PDF extraction/OCR code paths and optional embedding-loading code path.
- Basic explicit goal tracking and manual recall prompts/self-ratings.
- PWA manifest and service worker foundation.

### Partial or not yet verified
- Production build and dependency installation are not verified in this environment.
- Semantic model download, embedding quality, PDF/OCR paths, and service-worker behavior need end-to-end browser tests.
- Storage remains localStorage in this prototype, not a robust IndexedDB data layer.
- Nested threads, full cross-links, advanced revision diff/restore, and rich media management need implementation.
- Longitudinal memory evolution, contradiction detection, knowledge graph semantic edges, spaced repetition, evidence-based mastery, and evaluated predictions are not complete.
- Component screen is a preference/status surface, not a secure dynamic installer.
- Privacy/network audit, full deletion guarantees, iPhone offline behavior, and backup recovery need verification.

## Definition of done

A feature is complete only when it has a working UI, persistent data model, error/empty states, source evidence where applicable, accessibility behavior, tests, and documentation. A feature is not complete merely because it appears in a roadmap or screen mockup.
