# PocketWise QA Report: precise onboarding spotlight

## Changes
- Changed the balance tour target from the full `.money-card` to `.money-card .radial-area`.
- Positioned the tour card above or below the highlighted target according to available viewport space.
- Explicitly layered the spotlight and modal dialog to keep the dialog controls accessible.
- Retained scroll/resize repositioning, explicit Skip, and Next/Finish navigation.
- Bumped service worker cache to `pocketwise-shell-v2.0.10`.

## Checks
- `node --check onboarding.js`: passed
- `node --test tests/project-validation.test.cjs tests/sms-parser.test.cjs`: 23 passed, 0 failed
- ZIP integrity: verified

## Not claimed
No real iPhone browser automation or physical-device visual test was available. The positioning algorithm is validated at source/test level only; verify on the deployed iPhone PWA.
