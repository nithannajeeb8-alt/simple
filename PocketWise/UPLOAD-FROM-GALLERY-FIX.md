# PocketWise gallery upload fix

## Changes
- Added a dedicated **Choose from gallery** control using `<input type="file" accept="image/*">` without the camera capture hint.
- Added a separate **Take a photo** control using `capture="environment"`.
- Both image sources feed the same preview, file-size/type validation, and OCR workflow.
- Updated mobile layout and bumped service-worker cache to `pocketwise-shell-v2.0.6`.

## Deploy
Upload the contents of this folder to the existing PocketWise deployment. Reopen/reload the PWA after deployment; if it still serves old assets, close it and reopen after the service worker updates.

## Verification
`node --check app.js` passes. Automated Node tests: 21 passed, 0 failed. Device-level gallery picker behavior has not been tested on a physical phone.
