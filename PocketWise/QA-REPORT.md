# PocketWise 2.0 QA Report — Plus Menu & Screenshot OCR

## Implemented
- Removed the persistent floating Import Payment pill from the home screen.
- Added **Import payment** as the third action in the central `+` menu, alongside Quick entry and Detailed entry.
- Added image upload / camera capture for payment screenshots.
- Added in-browser OCR using Tesseract.js loaded from jsDelivr on demand. Image recognition runs in the browser; image files are not sent to PocketWise servers.
- OCR text is placed into the existing import parser for amount, recipient, date, UPI handle, reference and account suffix extraction where recognizable.
- Kept the existing review-before-save flow and duplicate checks. Users must verify OCR results before committing a transaction.
- Added file-type/size checks (images only, maximum 15 MB), preview, progress/status, error handling, and manual paste fallback.
- Improved recipient parsing for common screenshot labels such as “Paid to …”.
- Updated CSP for the OCR script/worker resources and bumped the service worker cache to `pocketwise-shell-v2.0.5`.

## Validation
- `node --check app.js`: passed.
- `node --test tests/*.test.cjs`: 21 passed, 0 failed.
- ZIP integrity: checked after packaging.

## Limitations
- OCR's first use requires an internet connection to load Tesseract.js and its English model from jsDelivr. This is browser-side OCR, not an embedded offline model.
- OCR quality depends on screenshot clarity, cropping, language and UPI app layout. This build supports English-script OCR and heuristic field extraction, not a guaranteed app-specific parser for every UPI provider.
- All extracted values remain a draft. The user must review the amount, direction, payee, date, category and account before saving.
- A real iPhone/Android browser test has not been performed in this environment.

## Implementation references
- Google ML Kit text recognition documentation (native Android reference): https://developers.google.com/ml-kit/vision/text-recognition/v2/android
- Google ML Kit document scanner documentation: https://developers.google.com/ml-kit/vision/doc-scanner
- Tesseract.js project/documentation: https://github.com/naptha/tesseract.js
- Paytm UPI transaction receipt details: https://paytm.com/support/upi/how-to-get-upi-transaction-receipt-on-paytm
