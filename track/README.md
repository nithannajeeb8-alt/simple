# Pocketwise

Pocketwise is a dependency-free, local-first personal finance PWA. Open it from any static web server (for example, a local preview server or a static host) to enable its install and offline support.

## What is stored

Financial records, accounts, budgets, debts, goals, reminders, profile preferences, and application settings are stored on this browser using IndexedDB, with a local-storage fallback. No account or remote service is required.

## First use

1. Create a local profile.
2. Add an account before recording money movement.
3. Add income, expenses, transfers, reminders, budgets, debts, and goals as needed.
4. Export a JSON backup from Settings regularly.

The optional example workspace is clearly labelled and can be cleared without removing your profile or preferences.

## Safety notes

- Transactions are only saved after form confirmation.
- Transfers do not change income or expense reports.
- Debt repayments are linked to their debts and excluded from ordinary cash-flow reporting.
- Savings-goal contributions track progress without altering balances or cash flow.
- Browser alerts and voice entry are offered only when the browser supports them.

## Files

- `index.html` — app shell
- `styles.css` — responsive premium interface
- `app.js` — local storage, financial calculations, forms, reports, assistant, and exports
- `sw.js` / `manifest.webmanifest` — PWA support
