# Shared-cost calculation and data flow — PocketWise 2.4.8

## Data flow

1. The entry chooser routes to Quick entry, Detailed entry, Import payment or Advanced entry. Quick entry remains the primary route.
2. Detailed entry opens the two dedicated planning tools: Quick bill split and Event planning.
3. The UI captures names, participant/group membership, category amounts and allocation preferences.
4. `shared-costs.js` validates the draft and produces a calculation result. Calculation functions are separate from DOM rendering and persistence.
5. The UI shows a reconciliation status and disables save/download while any required total or share is invalid.
6. Save persists the plan into the local `billSplits` or `eventPlans` collection. It does not add or mutate transactions, accounts or balances.
7. Download builds a standalone print-ready report from the validated calculation result. The report can be printed or saved as PDF using the browser/system print dialog.

## Monetary representation

All amounts are converted to integer minor units (paise) before calculation. This avoids accumulating floating-point fractions when distributing money.

### Equal allocation

For total paise `T` and `n` recipients:

- Base share = `floor(T / n)`.
- Remainder = `T - baseShare * n`.
- The first `remainder` recipients receive one additional paise.

The result always sums to `T`.

### Percentage allocation

Percentages are accepted to two decimal places and stored/calculated as basis points, where 100% = 10,000 basis points. For each recipient, the engine calculates an integer floor allocation and a remainder. Remaining paise are assigned in descending remainder order (stable recipient order breaks ties). Percentages must total exactly 100%.

### Exact amount allocation

Each submitted share is parsed to paise. Shares must be non-negative safe integers and their total must equal the target amount exactly.

### Event categories

The sum of all category amounts must equal the event total. Each category independently uses one of:

- Equal: distribute to every individual or every group equally.
- Percentage: allocate the category by the configured percentage for each individual or group.
- Exact amount: use the configured paise amount per individual or group.

In group mode, a category is allocated to groups first. Each group's allocated category amount is then split equally among that group's named members. This is deliberate and disclosed in the editor and report; custom percentage/exact-amount shares are applied at group level, not separately to each person within a group.

## Validation

- Bill splits require 2–100 named people with unique IDs.
- Events require 1–100 named participants and 1–30 uniquely named categories.
- Group mode requires 1–25 uniquely named groups. Every participant must belong to exactly one group; empty groups are rejected.
- Every non-equal category must contain exactly one share for each active unit (person or group), with no stale or duplicate share IDs.
- Every percentage allocation must total exactly 100.00%.
- Every exact-amount allocation must reconcile exactly to the category amount.
- Category amounts must reconcile exactly to the event total.
- All sums are checked for safe-integer overflow.

## Persistence and privacy

`billSplits` and `eventPlans` are optional schema collections with safe defaults. They are included in backup/restore, state normalization and reset/merge flows. Plans remain on-device using the existing app persistence mechanism. Reports are built locally and are not sent to a service.

## Accounting boundary

A plan is not a transaction. Saving a bill split or event budget records an agreed allocation only. It does not assert that someone paid, that money changed hands, or that a person owes a legally enforceable amount. Actual payments should still be recorded through PocketWise's normal transaction/debt features when they occur.
