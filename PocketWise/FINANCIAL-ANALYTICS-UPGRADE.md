# PocketWise 2.4.0 — Financial Analytics & Smart Budgeting

## What changed

This is an additive upgrade to the existing PocketWise PWA. It retains the current HTML/CSS application, app state and persistence model, account and transaction flows, OCR/import/Shortcut/share-target features, and viewport protections.

### User-facing features

- Period-aware financial overview for week, month, year and custom ranges, with previous/next navigation, current balance, historical opening/closing positions, income, expenses, refunds, net movement and prior-period comparison.
- Historical completeness notes. Historical positions without a dated account opening balance are marked provisional rather than represented as verified history.
- Activity grouping for week (day), month (Monday-based calendar week), year (month), and all history (expandable year/month). Group summaries show income, expenses, refunds, net movement and transaction count. Existing search/filter/edit/delete/undo paths are retained.
- Reconciled cash-flow statement with salary, other income, refunds, repayments received, borrowing, normal outflows, bills, subscriptions, debt repayments, lending, other flows and a separate own-account transfer line.
- Personal balance sheet with account cash, negative account liabilities, outstanding lent/borrowed amounts, receivables, liabilities and net worth. It explicitly excludes unentered external assets/liabilities.
- Paired current/previous category comparison chart, same-category colour pairing, current solid/previous lighter dashed line, top five plus Others, daily alignment, totals and a textual table.
- Prioritised financial insights and warnings with evidence and suggested actions. Forecasts are suppressed when data volume/regularity is too weak.
- Salary planning for monthly, fortnightly and weekly pay, fixed and percentage allocation rules, savings/debt/discretionary allocations, expected payday, actual salary override, validation, over-allocation and unallocated income. These are planning rules only and do not create transactions or transfers.
- Category budget dashboard with actual spend, remaining limit, utilisation, eligible end-of-period projection and previous-period comparison. Existing total/category budgets are preserved.
- Separate downloadable HTML cash-flow and balance-sheet reports, styled for browser Print / Save as PDF. Existing CSV export remains available.

## Files changed

| File | Change |
|---|---|
| `finance-analytics.js` | New pure calculation module. Provides shared date, period, balance, cash-flow, balance-sheet, category comparison, salary allocation, budget projection and prioritised insight calculations. |
| `app.js` | Integrates finance calculations with the existing state, account opening-date editing, period navigation, finance panels, Activity grouping, salary settings, report generation and deduplicated alerts. |
| `index.html` | Adds the analytics module script and finance / activity UI controls within the existing application structure. |
| `styles.css` | Adds responsive finance panel, grouped activity, chart legend/table and print-report styling using the existing theme. |
| `sw.js` | Bumps the shell cache to `pocketwise-shell-v2.4.0-financial-analytics` and precaches `finance-analytics.js`. |
| `tests/finance-analytics.test.js` | New focused calculation regression suite (57 assertions). |
| `tests/clipboard-import.test.js` | Updates expected service-worker cache identifier; existing clipboard behavior tests remain intact. |
| `tests/shortcut-settings.test.js` | Updates expected service-worker cache identifier; existing Shortcut behavior tests remain intact. |

## Financial calculation and data flow

1. Existing persisted app state remains the source of truth. Normalisation adds a safe `settings.salaryPlan` default and retains legacy budgets, accounts and transactions.
2. Existing transaction records and account records are passed to `PocketWiseAnalytics`. The module does not access the DOM, storage, network or notification APIs.
3. The calculation module normalises transaction dates to local calendar dates and performs money aggregation in integer paise. Values are converted to the existing INR display conventions at the presentation boundary.
4. Account balance at a date = opening balance + qualifying account movements through that date. An account's opening date is required to verify its historical coverage. Where it is missing, historical values are explicitly provisional.
5. Consolidated cash movement excludes transfers between the user's own accounts. Each transfer still changes the relevant individual account balances and is listed separately in the statement.
6. Income, refunds, borrowing, repayments received, expenses, lending and debt repayments remain separate classes. Borrowed money is not earned income; principal repayments are not normal purchases.
7. The overview, cash-flow statement, balance sheet, comparison chart, budget dashboard, priority insights and downloadable reports consume the same shared calculation results to reduce conflicting totals.
8. Salary allocations are non-cash planning rules. Actual account balances use recorded transactions only; a recorded salary receipt supersedes expected salary for that pay cycle's allocation calculation.

## Tests and verification

Run from the `PocketWise` directory:

```sh
node --check app.js
node --check finance-analytics.js
node tests/finance-analytics.test.js
for f in tests/*.test.js; do node "$f"; done
```

Results from the packaged source:

- New financial calculation suite: **57/57 assertions passed**.
- Existing regression suites: **85/85 assertions passed across 11 suites**.
- Total: **142/142 assertions passed across 12 test files**.
- HTML parser/static audit: passed; 163 IDs checked with no duplicate IDs.
- Local script and stylesheet references: 14 checked, none missing.
- `finance-analytics.js` is loaded by `index.html` and included in the service-worker app-shell cache.
- `node --check app.js` and `node --check finance-analytics.js`: passed.

The regression suites cover clipboard and Shortcut behavior, spatial import handling, OCR fallback/parser, PaddleOCR CSP and tiling, viewport protections and Android share-target flow. The new calculation suite covers calendar boundaries, leap years, custom ranges, multiple accounts, transfers, refunds, borrowing/lending/repayments, opening-date coverage, balance-sheet debt/receivable treatment, salary allocations, under/over-allocation, forecast evidence thresholds, category comparisons and paise precision.

## Limitations and verification boundaries

- Browser-rendered UI testing could not be completed in the available execution environment: the browser navigation attempt was blocked by the sandbox (`ERR_BLOCKED_BY_ADMINISTRATOR`). Consequently, screenshots/visual inspection at 390×844, Android and desktop, actual theme rendering, real PWA offline relaunch and live browser print-dialog behavior were not verified here.
- No physical iPhone or Android device was available. This is not a claim of device testing.
- The downloaded reports are standalone print-ready HTML, not direct PDF files. Open the downloaded report in a browser and use Print → Save as PDF.
- A historical balance is only verified when the relevant account has a known opening-balance date and the required dated transactions are present. Without that, the UI/report flags the coverage as provisional; external accounts, property, investments or debts not entered into PocketWise are not part of net worth.
- Forecasts are estimates based on recorded upcoming reminders, debt due dates, configured payday and observed spending. They are not bank-confirmed bill schedules or guaranteed future balances.
- Existing account/transaction classification fields are used. Unknown or unclassified transaction types fall back to a visibly generic category rather than being guessed as salary or debt.

## Deployment

1. Back up the current PocketWise data from the existing app before deploying the new files.
2. Extract this ZIP and replace the contents of the repository's existing `PocketWise/` app directory with the included `PocketWise/` directory. Keep the repository's parent layout unchanged.
3. Commit and deploy the files using the same GitHub Pages workflow currently used for PocketWise. No backend, secrets, new network endpoint or external analytics dependency is required.
4. The service-worker cache identifier has been changed. After deployment, open the app online once so the updated shell and `finance-analytics.js` can be installed. If an old shell remains, close the installed PWA and reopen after the service worker activates; do not clear app data unless the backup has been checked.
5. Test a backup/restore on a copy of the data first, then verify account balances, a known transfer, a refund, an existing budget and a salary record before relying on the new reports.

## Version note

This source package is labelled **2.4.0 Financial Analytics** for the additive finance module and cache generation. It is based on the supplied `2.3.54-iOS-Viewport-Lock-Fix` source and the corresponding core files checked against the connected GitHub repository on 2026-10-30. No GitHub commit or live deployment was made as part of this package creation.
