# Pocketwise

A local-first personal finance PWA prototype built with vanilla HTML, CSS and JavaScript. It is designed for static hosting such as GitHub Pages and can be installed on compatible iOS and Android devices.

## Included

- Four sections: Home, Activity, Insights and Settings.
- Exactly two themes: Light and Dark.
- Two vertically stacked semicircular arcs on Home: one shared income/expense arc, then a separate days-progress arc.
- Transaction entry for income, expenses, transfers and refunds.
- Accounts, activity categories, optional notes, search and filters.
- Debts and lending with linked partial repayments and settlement history.
- Custom budgets, category limits, budget alerts and spending summaries.
- Savings goals, payment reminders, and notification preferences.
- Multiple chart structures and year-by-year reporting.
- JSON full backup and restore, plus CSV transaction export.
- IndexedDB-first storage with a localStorage fallback.
- PWA manifest shortcuts, service-worker app-shell caching and an installation guide in Settings.
- Bootstrap Icons when online, with built-in SVG fallbacks for offline use.

## Try it locally

Service workers and installability require localhost or HTTPS. Do not open `index.html` directly as a `file://` URL.

With Python installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Deploy to GitHub Pages

1. Create a GitHub repository for the site.
2. Upload the **contents** of this folder to the repository root, including `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, and the `assets` folder.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**, then choose the `main` branch and `/(root)`.
5. Save and wait for GitHub Pages to publish the HTTPS URL.
6. Open the published URL on your phone and use the Settings screen's installation guide.

If you deploy inside a repository subpath, keep the folder structure intact. The app uses relative asset paths so it can run from the project root or a GitHub Pages project site.

## Install on iPhone

1. Open the HTTPS website in Safari.
2. Tap Share, then choose **Add to Home Screen**.
3. Enable **Open as Web App** if the option appears, and add it.
4. In Pocketwise → Settings, open **Back Tap / Quick Add** for instructions and the Quick Add URL.
5. In Apple Shortcuts, create a shortcut with an **Open URLs** action using that URL. Assign that shortcut in **Settings → Accessibility → Touch → Back Tap → Double Tap**.

Important: a PWA cannot read the iPhone Back Tap gesture directly. The Shortcut is a bridge. Depending on iOS behavior, the URL may open in Safari instead of the standalone web app, so test this on the target phone before relying on it.

## Install on Android

1. Open the HTTPS site in Chrome.
2. Choose **Install app** or **Add to Home screen** from the browser menu.
3. If the browser and launcher support web-app shortcuts, long-press the installed icon to access Expense, Income or Debts shortcuts.

A true Android Quick Settings tile or native interactive widget requires a separate native Android companion. It is not provided by this PWA.

## Data and backups

- Records are stored in the browser on the current device by default. They are not automatically synced to another device.
- Export a JSON backup regularly. Keep it somewhere safe and private.
- Use JSON to restore the full workspace, including account/category/debt relationships and settings. CSV is for transaction-table use and is not a complete app backup.
- Import offers replace or merge choices. Review the confirmation prompts carefully.
- Persistent browser storage can be requested from Settings, but browsers may decline it and local data can still be removed. Backup is essential for long-term retention.
- The prototype begins with sample data so the screens and charts are visible. Use **Clear sample** on Home to create a clean workspace; the first new transaction or budget setup also switches away from the sample workspace.
- No bank connection is included. Do not enter bank passwords, card PINs or UPI PINs.

## Notes and limitations

- This is a client-side prototype, not a bank-connected financial service. Verify the accounting behavior with test records before relying on it for important bookkeeping.
- Browser notifications require permission and may be limited or delayed by the platform, especially while the app is closed. In-app alerts are available when the app is open.
- Voice draft uses browser speech recognition where available and requires the user's confirmation before saving.
- Online Bootstrap Icons and font resources may not load offline; the app includes icon fallbacks and system-font fallbacks.
- Data is not encrypted by this prototype at the application layer. Device security and private backups matter.

## File structure

```text
pocketwise-app/
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
├── sw.js
├── README.md
├── .nojekyll
└── assets/
    └── icons/
        ├── icon.svg
        ├── icon-192.png
        └── icon-512.png
```
