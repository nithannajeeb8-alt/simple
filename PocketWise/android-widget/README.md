# PocketWise 2.0 upgrade package

## Included in this build
- Existing PocketWise PWA preserved; IndexedDB/localStorage state schema and saved records are not intentionally reset.
- Payment text import UI with conservative parsing for INR amount, direction, date, UPI ID, RRN/UTR/reference, account suffix and counterparty where recognizable.
- Review-before-save workflow and duplicate warning (reference-first, heuristic fallback).
- Platform-aware CSS classes and iPhone Shortcut payload query handling; clipboard paste remains the reliable iOS fallback.
- Web Share Target for shared text and PWA cache version bump.
- Android native widget/WebView starter project with resizable widget, balance, 7-day spending field, and Quick Add launch.

## Important platform boundaries
This is a source upgrade, not a signed Android APK. Build `android-widget/` in Android Studio with Android SDK 35 and a compatible Gradle JDK. The Android wrapper loads the hosted PWA URL; update that URL if your GitHub Pages path differs. The widget bridge is included, but the web app must call `window.PocketWiseNative.updateWidget(balance, weekLabel)` after state changes for live widget values. The bridge is a native wrapper feature and does not work in ordinary Safari/PWA mode.

GitHub Pages cannot accept a POST share-target upload, so this build configures GET-based text sharing only. Screenshot file sharing and OCR are not falsely advertised as working in the PWA. For screenshots, use device text recognition (iOS Live Text / Google Lens) and paste extracted text into Import Payment. A production Android build should add ML Kit OCR and Android ACTION_SEND handling before calling screenshot import complete.

iOS cannot allow a website to read Messages history or control Back Tap directly. Use an Apple Shortcut to send a transaction payload or copy it to the clipboard, then paste it into PocketWise. No automatic cloud sync is added; records remain local to the browser profile.

## Test checklist
- [ ] Verify parsing on real bank SMS samples from each bank.
- [ ] Verify duplicate detection against existing transactions and screenshot/SMS pairs.
- [ ] Build and install the Android wrapper; add and resize the widget.
- [ ] Wire `PocketWiseNative.updateWidget(...)` to the real balance and seven-day expense total in `app.js`.
- [ ] Test iOS Shortcut launch, clipboard fallback, receipt print popup, offline install, and migration with a backup copy of real data.
- [ ] Test every screen at narrow mobile widths and with the keyboard open.

This package does not claim all 12 release checks have passed. Native widget behavior requires a built and installed Android app and physical-device verification.
