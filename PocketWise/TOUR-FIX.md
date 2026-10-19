# Guided tour fix

## Fixes
- Added a separate spotlight layer so highlighted content no longer covers the tour dialog.
- Kept the Next/Finish button visible above the spotlight on mobile layouts.
- Tapping the dimmed area no longer ends the tour.
- Pressing Escape no longer silently exits the tour; users can choose Skip tour or finish the guided steps.
- Spotlight follows its target during scrolling and window resizing.
- Tour card is constrained to the visible viewport and can scroll on short screens.
- Updated service-worker cache to v2.0.9.

## Verification
- `node --check onboarding.js`: passed
- `node --check app.js`: passed
- `node --test tests/*.test.cjs`: 22 passed, 0 failed
- ZIP integrity: verified after packaging

The automated tests verify source-level expectations. Visual testing on a physical iPhone/Android device is still required.
