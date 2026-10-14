# Little Days · Life Companion

A responsive, local-first life companion prototype built with plain HTML, CSS and JavaScript. No npm install or build step is required.

## What's included

- Today dashboard, habit tracking, essential-habit scores, streaks and weekly overview.
- Calendar, life-in-weeks illustration, statistics and Daily Memories.
- Optional mood check-ins and curated, non-diagnostic wellbeing prompts.
- Discover sections for books, food, exercise, openly licensed imagery, prayer times, Quran text, hobbies and open resources. Public endpoints are used where appropriate; USDA FoodData Central and Quran Foundation credentials are not embedded in the client.
- Routine preferences, medication notes, theme selection, text-size settings, Reduce Motion, local export/restore/delete.
- First-run introduction asking for preferred name, optional date of birth and optional religion/spiritual preference, with an explicit privacy explanation.
- Seven themes: Sky, Coral, Mint, Lavender, Dynamic, Midnight and Plum.
- PWA manifest, service worker and a simple sunrise app icon in SVG, PNG and Apple Touch Icon formats, with a separate maskable PWA asset.

## Design notes

The layout system uses a consistent spacing scale, semantic theme tokens, responsive content widths, iPhone safe-area padding, and shared form/card rules. Midnight and Plum share the same component system as the light themes; they do not invert only the page background. See `DESIGN-SYSTEM.md` for the rules and Apple HIG references.

## Privacy

Profile data, habits, mood entries, memories and preferences are saved in this browser using `localStorage`. Browser storage is **not encrypted** and may be visible to someone with access to this browser/device. Exported backup files are not encrypted by this app. Online search or location features send the relevant query/location to third-party APIs. There is no account system or sync service in this prototype.

## Run locally on Windows

1. Extract the ZIP.
2. Double-click `index.html` to explore the interface and local features.
3. For service-worker/PWA testing, open a terminal in the folder and run `python -m http.server 8080`, then visit `http://localhost:8080`.
4. To install on iPhone, host the project over HTTPS, open it in Safari and use **Share → Add to Home Screen**.

## Deploy to GitHub Pages

1. Upload the contents of the extracted folder to the root of the repository.
2. In GitHub repository Settings → Pages, choose GitHub Actions as the deployment source.
3. Push the files to `main`; the included workflow publishes the root folder.
4. Open the HTTPS site and check the welcome screen, all themes, navigation, form controls and stored data before replacing any live deployment.

## Prototype limitations

- Data storage currently uses `localStorage`, not IndexedDB. Export backups regularly if the records matter to you.
- Calendar reminders can be created for a specific date with a task time and a separate alert time. They are stored locally, shown in the selected-day panel, and can trigger a system notification while the app is open and the page scheduler is running. Notification permission is requested only after the user taps Enable.
- Important limitation: this static, local-first PWA cannot guarantee alarms while fully closed or suspended. Reliable background alerts require a push backend (VAPID keys, push subscription storage, and a server/edge function that sends scheduled pushes). On iPhone, install the website to the Home Screen and use a supported iOS version for Web Push; a permission prompt alone is not enough.
- API availability, provider CORS rules, rate limits and service terms can change. Test live requests on the hosted site; no private API keys are included.
- Medication entries are notes only and do not verify medicines or schedules. Follow the prescription/clinician instructions.
- The life-in-weeks view uses a configurable baseline as an illustration, not a prediction.
- This project has not had complete real-device iOS/Android, WCAG, security or performance testing. After deployment, reopen the site once with an internet connection so the updated service worker can replace the old cached shell.


### Life-map and layout refinement (v8)
- Native time/date controls are explicitly constrained to their grid/card width for iOS Safari.
- The 52-column life-week grid resets native button padding and border sizing so its cells stay inside the card.
- Life-map totals show estimated elapsed, remaining and total days alongside weeks represented. Date of birth is used when supplied; otherwise the estimate uses the entered age.
- Perfect days are highlighted in gold in the monthly calendar; a life-week tile is also highlighted if it contains a recorded perfect day. A perfect day means every currently selected essential habit was completed.


### Calendar reminders (v9)
- Select a date in Calendar → Month and use **Add** under Plans & reminders.
- Each reminder stores a title, date, task time, independent alert time, and optional note. Edit/delete are supported; calendar dates with reminders show a marker.
- The page checks due reminders every 15 seconds while open and displays a system notification if permission is granted, with an in-app toast fallback. Due alerts are deduplicated locally.
- This is a foreground-capable reminder implementation, not a guaranteed background alarm. For alerts after the browser/app is closed, deploy a real Web Push backend and persist subscriptions securely on a server. Apple documents Home Screen Web Push for iOS/iPadOS 16.4+; notifications must be user-visible and permission must be requested from a user gesture.
