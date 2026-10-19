# PocketWise 2.0 · Android installation fix

## Important
This ZIP is the **PWA website source plus an Android widget project**, not a compiled APK. To install the website as an app, deploy the contents of `PocketWise-2.0/` to `https://nithan.in/PocketWise/`, then install from Chrome. The native WebView/widget must separately be built in Android Studio; this archive does not contain a signed APK. The `android-widget/` folder is a separate native Android widget project and is not needed for ordinary PWA installation.

## Deploy
1. Back up the current PocketWise site and data first.
2. Upload the *contents* of `PocketWise-2.0/` to the root of the existing `PocketWise` website folder/repository. Do not upload the outer `PocketWise-2.0` folder as an extra nested directory.
3. Confirm these URLs load without 404 errors:
   - `https://nithan.in/PocketWise/`
   - `https://nithan.in/PocketWise/manifest.webmanifest`
   - `https://nithan.in/PocketWise/sw.js`
   - `https://nithan.in/PocketWise/assets/icons/icon-192.PNG`
   - `https://nithan.in/PocketWise/assets/icons/icon-512.PNG`
4. On Android, open the site directly in **Chrome** (not an Instagram, WhatsApp, or other in-app browser).
5. Open Chrome's ⋮ menu and choose **Install app** or **Add to Home screen**. If the install option is missing, update/reload Chrome, open the URLs above to check for 404s, then clear only the site's cached files/service worker and reload. Do not clear site storage unless you have exported your finance data.

## What changed
- Manifest uses relative `id`, `start_url`, `scope`, icon, and shortcut URLs so it resolves correctly under `/PocketWise/`.
- Service-worker cache version bumped to `v2.0.2` for this patched release.
- PWA registration logs a clear success/error in the browser console.
- Import Payment button redesigned with a custom offline-capable SVG document/payment icon and responsive dual-tone glass styling.
- Fixed symbol-free SBI SMS parsing, added swipe-right-to-delete with undo, and corrected the transaction undo identifier.

## Validation
The archive, manifest JSON, icon dimensions, and JavaScript syntax should be checked before deployment. Installation still depends on the deployed HTTPS site and browser eligibility; a source ZIP alone cannot install itself.
