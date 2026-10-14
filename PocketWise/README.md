# Pocketwise

Pocketwise is a local-first personal finance PWA for tracking transactions, budgets, savings goals, debts and lending.

## Important changes in this revision

- Starts with a **clean workspace**: no fabricated balances, transactions, debts, goals, or reminders.
- Existing installs from the previous preview build that still have `sample: true` are migrated to a clean workspace once. Workspaces already marked personal are preserved.
- Reworked mobile layout for readable text, properly wrapping cards and controls, safe-area-aware bottom navigation, and accessible form sizing.
- Form controls use at least 16px text to prevent Safari's automatic focus zoom in typical iOS form interactions. Page zoom remains enabled for accessibility.
- Added a visible **Savings goals** shortcut near the top of Insights so the goals section can be reached without hunting through a long page.
- Kept the dual semicircular arcs, four main tabs, Light/Dark themes, debt tracking, insights, budgets, reminders, backup/restore, and CSV export.

## Run locally

Serve this directory over HTTP (service workers do not work from ordinary `file://` URLs):

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in a browser.

## Deploy to GitHub Pages

1. Extract this project ZIP.
2. Upload the **contents** of `pocketwise-app/` into the root of a GitHub repository (including `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js`, and `assets/`).
3. In repository Settings → Pages, select the branch and root folder.
4. Open the HTTPS Pages URL and test all tabs, create/edit flows, backup/restore and offline reload.
5. On iPhone, open the URL in Safari → Share → Add to Home Screen.
6. On Android, open the URL in a supported browser → Install app / Add to Home screen.

## Storage and backups

Records are stored locally in IndexedDB where available, with a localStorage fallback. Browser storage is not a permanent backup. Use Settings → Export full backup regularly. JSON backup preserves application relationships; CSV is for spreadsheet analysis.

## iPhone Back Tap

The PWA cannot directly listen for the iPhone Back Tap gesture. Configure an Apple Shortcut to open the Quick Add URL as a best-effort convenience. On iOS, verify whether the URL opens the installed web app or Safari on your particular version.

## Limitations

- Native Android Quick Settings tiles and interactive widgets require a native companion.
- Background notifications and service-worker behavior depend on browser/OS support and user permission.
- This project needs real-device testing on current iOS Safari and Android Chrome before being treated as production-ready.


## v1.3.1 reliability fixes

- Transaction amount accepts decimal entries and pasted Indian-number formatting.
- IndexedDB writes are awaited and checked; localStorage is mirrored when available, and save failures are surfaced instead of silently reported as success.
- Transaction saving rolls back in-memory changes if durable browser storage fails.
- Every saved transaction has a local printable receipt with a reference ID, timestamp, account, payment method, note and an explicit disclaimer that it is a personal record rather than bank-issued proof. Receipts can be printed or saved to PDF without uploading financial data.
- Fixed a root-level event selector that intercepted almost every click; only the actual Light/Dark theme buttons now handle theme changes.
- Fixed the transaction-type click selector so pressing Save no longer gets mistaken for a type-switch action.
- Fixed a render-time selector bug that could throw while updating net-balance colour.
- Receipts now open immediately after a successful save, and can be opened again from each transaction's details. Print / Save PDF uses a standalone local document with print-specific styling; it does not upload personal finance data.
- Money uses consistent Indian digit grouping and shows exactly two decimal places only when the value has paise. Numeric columns use tabular figures; transfer fields are added and removed when the transaction type changes.
- Tested in headless Chromium at 320, 375, 390 and 430 CSS-pixel widths: startup, decimal/pasted amounts, persistence fallback, receipts, income, transfers, invalid amounts, failed-storage rollback, theme toggling, navigation, and responsive bounds passed. This is not a substitute for testing current iOS Safari / Android Chrome on-device.
