# Pocketwise v1.3.1 test report

## Browser harness

Tested with headless Chromium using the app's real HTML, CSS and JavaScript, a mobile viewport, and a controllable localStorage fallback. The environment blocks direct navigation to local files and localhost, so this does not substitute for running on a real HTTPS deployment.

## Passed checks

- Clean boot in an empty workspace; no uncaught page JavaScript errors.
- Paste and save `₹ 1,234.50`; persisted amount is the numeric value `1234.5` and displays as `₹1,234.50`.
- Receipt opens after a successful save and contains the saved note, amount, payment method, reference ID, and timestamp.
- Receipt print/PDF document is generated from saved data; receipt can also be reopened from transaction details.
- Reject amount with more than two decimal places without saving it.
- Save income, update the selected account and total balance, and generate receipt.
- Save transfer between two accounts; combined balance remains unchanged and receipt includes destination account.
- Edit an existing transaction without duplicating it; receipt updates.
- Transfer-only form field appears/disappears when changing transaction types.
- Light/Dark theme buttons and bottom navigation remain responsive.
- Simulated storage write failure triggers an error, rolls back the attempted transaction, and does not report success.
- Money card and balance text remain inside the card at 320, 375, 390 and 430 CSS-pixel widths; long formatted balance stays inside the viewport.

## Not verified in this environment

- Native iOS Safari / installed PWA and Android Chrome behavior.
- Operating-system print sheet and the final PDF output on device.
- IndexedDB writes on a real HTTPS origin. The test harness specifically tests the localStorage fallback and confirms its saved JSON state.

## Privacy note

The receipt is rendered locally from the stored transaction. Its contents are not uploaded to a receipt generator or external service. It is a personal record, not bank-issued proof of payment.
