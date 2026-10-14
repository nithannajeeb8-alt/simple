# Pocketwise 1.3.2 change and validation report

## Changes
- Replaced ambiguous debt direction labels with **Owed to me** / **I owe them**, supporting descriptions, dynamic amount labels, and matching explanatory copy.
- Replaced the mobile central plus button's generic transaction form with a focused four-step Quick Add flow: amount → income/expense/refund → category → optional note and account/payment method.
- `?quickadd=1` now opens that four-step flow, for use with an iPhone Back Tap Shortcut URL.
- Successful Quick Add uses the same local transaction/persistence and receipt flow as the standard transaction form. The last selected account and payment method are remembered in settings.
- Updated service-worker shell cache to `pocketwise-shell-v1.3.2`.
- Documented iOS system integration limitation: a PWA cannot render a custom interactive amount-entry interface inside Dynamic Island or capture a Dynamic Island double-tap. Native ActivityKit/App Intents integration requires a native iOS app.

## Checks run
- `node --check app.js`: passed.
- `node --check sw.js`: passed.
- HTML structure and referenced Quick Add/debt form identifiers inspected in source.
- ZIP integrity check: passed after packaging.

## Not verified in this environment
- Interactive Chromium test execution was blocked by the environment's browser-navigation policy for both local HTTP and `file://` URLs. Therefore, no claim is made that an end-to-end browser interaction suite passed in this run.
- Must still be checked on the deployed HTTPS site on iPhone: launch via Back Tap Shortcut, keyboard behavior, IndexedDB persistence, receipt print/save as PDF, and visual fit on the target device.

## v1.3.3 iPhone Shortcut prefill route

- Added `?quickadd=shortcut&amount=...&type=...&category=...&note=...` support. Valid amount/type/category opens the prefilled final review/save step; missing or invalid fields fall back to the appropriate remaining step.
- Category names/IDs are matched against the current workspace and transaction type before use; unmatched categories open the category picker. Notes are capped at 240 characters and HTML-escaped in the form.
- The captured query is removed from the address bar with `history.replaceState` after reading. This reduces exposure but does not guarantee the URL was never recorded by browser/OS diagnostics.
- Added `SHORTCUT_SETUP.md` with Back Tap setup instructions and a test checklist. The Shortcut itself must be created in Apple's Shortcuts app on the user's iPhone; a portable `.shortcut` file cannot be reliably authored/signature-verified from this web-only project.
- `node --check app.js`, `node --check sw.js`, and `node tests/quickadd-shortcut.test.cjs` pass. A full Chromium end-to-end run was attempted but this environment blocks browser navigation to both local HTTP and file URLs (`ERR_BLOCKED_BY_ADMINISTRATOR`), so iOS Shortcut invocation and live IndexedDB save are not claimed as browser-verified.


## v1.3.6 Shortcut handoff repair

- Expanded the Quick Add receiver to read parameters from either the URL query string or URL fragment, which helps diagnose launchers that relocate parameters.
- Normalized common shortcut labels including `Purchase / Expense` to Pocketwise's internal `expense` type.
- Updated the Shortcut setup guide to call out the likely magic-variable mix-up visible in the provided screenshots: `amount=` must use the output of **Ask for Number**, not **Provided Input** from **Receive from Share Sheet**; `category=` must use the category prompt output, not the transaction-type menu result.
- Bumped the service-worker cache to `pocketwise-shell-v1.3.6`.
- Checks run for this package: `node --check app.js`, `node --check sw.js`, `node tests/quickadd-shortcut.test.cjs`, and ZIP integrity.
- Not verified: running this on the user's physical iPhone or editing the already-shared iCloud Shortcut automatically. The Shortcut actions must be corrected in Apple Shortcuts.
