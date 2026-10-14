# Little Days · Life Companion

A mobile-first, MyDairy-inspired life and habit companion prototype built with plain HTML, CSS and JavaScript. No npm install or build step is required.

## Included in this prototype
- Four main sections: Today, Calendar, Faith / Discover, Settings.
- Seven-dot current-week home view and Perfect Weeks counter.
- Custom habits and essential-habit scoring.
- Monthly calendar, estimated life-in-weeks grid and statistics.
- Optional mood check-ins with gentle, non-diagnostic suggestions.
- Optional Daily Memories, search, editing and deletion.
- Custom hobby catalogue, prayer check-in records, local medication records.
- Routine preferences for water, meals, skill practice, family time, motivation and quiet hours.
- MyDairy-inspired Sky, Coral, Mint, Lavender and Dynamic themes.
- Local browser storage, JSON export/restore and deletion.
- Open-source/data resource directory and Settings → Credits.
- PWA manifest and app-shell service worker.

## Important prototype limitations
- Records are stored in this browser's localStorage for this initial build. Do not use private browsing for long-term storage; export backups regularly. A production version should migrate to IndexedDB.
- Reminder times are saved as preferences only. Reliable scheduled notifications are NOT implemented. Browser permission alone does not schedule notifications.
- Prayer times, Quran content, food data and exercise APIs are linked but not yet connected to live services.
- Medication entries are local records only, not medical advice or verified medicine data.
- The 74-year life grid is a configurable illustration, not a lifespan prediction.
- Mood suggestions are simple curated text, not AI or clinical guidance.
- Online font and Bootstrap Icons CDNs enhance the design; core navigation uses text fallbacks, but some icons may not appear offline until cached.
- No third-party decorative photos are bundled in this version. Add licensed assets only after verifying each asset's license, creator, source URL and attribution requirements, then add it to Settings → Credits.

## Run locally on Windows
1. Extract the ZIP.
2. Double-click `index.html` to explore core features.
3. For PWA installation/service worker testing, serve the folder over localhost:
   - Install Python 3 if needed.
   - Open a terminal in this folder and run `python -m http.server 8080`.
   - Open `http://localhost:8080`.
4. On iPhone, PWA installation requires HTTPS hosting: open the hosted URL in Safari → Share → Add to Home Screen.
5. On Android, open the hosted URL in Chrome → menu → Install app / Add to Home screen.

## Deploy to GitHub Pages
1. Upload the contents of this folder to the root of a GitHub repository.
2. Open repository Settings → Pages and select GitHub Actions as the deployment source.
3. Push to `main`; the included workflow publishes the root.
4. Open the HTTPS deployment URL on your phone.

## Before production
Move to IndexedDB, add schema migrations, implement a tested notification scheduler, connect API services through appropriate backend endpoints, verify licensing and medical-content sources, add robust date/timezone handling, and test on real iOS/Android devices.


## Profile, privacy and themes update

The first-visit welcome screen lets people choose a preferred name, date of birth and optional faith/spiritual preference. All fields are optional and the welcome screen can be skipped. The top-right profile control shows an add-profile icon until a preferred name exists; it then shows the user's initial and opens Settings. The profile can be edited later in Settings.

Settings now includes Rose, Ocean, Forest, Midnight and Plum alongside Sky, Coral, Mint, Lavender and Dynamic. Midnight and Plum are dark palettes. The welcome screen and Settings include a plain-language explanation of local browser storage, third-party API queries, backups, shared-device risk, deletion and the prototype's security limitations.

Privacy note: data is stored in browser localStorage and is not encrypted by this app. Avoid storing highly sensitive information on shared devices. The date of birth and faith preference are optional.
