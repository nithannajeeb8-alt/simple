# PocketWise 2.0 QA report (follow-up UI fix)

## User-reported defects addressed
- Reworked the floating payment-import launcher: removed the overlapping decorative badge/arrow, kept a single clear import icon, and improved text spacing.
- Moved the launcher higher above the mobile bottom navigation so it is less likely to overlap the tab bar.
- Added swipe-to-dismiss in either horizontal direction for the floating payment-import launcher. It hides for the current page session; reload restores it.
- Updated the Shortcut return banner to dismiss on either left or right horizontal swipe, not only left-to-right.
- Kept the banner's existing Paste and Enter key actions.
- Bumped the service-worker cache version to `pocketwise-shell-v2.0.3` so clients can receive the updated assets.

## Regression checks
- `node --check app.js`: passed.
- `node --test tests/*.test.cjs`: 20/20 passed.
- Existing tests cover the SBI SMS example, alternate parser path, amount/date handling, OTP rejection, duplicate references, PWA manifest/assets, static IDs, service-worker shell assets, transaction swipe-delete and Android widget configuration.

## Not device-verified
The app has not been run in Safari/iOS or Chrome/Android in this environment. The new import-launcher and Shortcut-banner swipe gestures need confirmation on the user's actual device after deployment. This ZIP is a PWA/source bundle, not an APK.
