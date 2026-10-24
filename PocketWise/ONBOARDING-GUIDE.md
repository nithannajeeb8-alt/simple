# PocketWise onboarding tour

- First-run guided tour with spotlight targets, progress, Skip and Next/Finish actions.
- Uses remote Unsplash photography for human/device/finance visuals instead of inline SVG illustrations in the onboarding tour.
- Remote images require an internet connection; if the image host is unavailable, the guide remains readable and the illustration area falls back gracefully.
- The image links are sourced from Unsplash image CDN. Unsplash says its standard license generally permits free personal and commercial use; verify individual asset/brand restrictions before distribution: https://help.unsplash.com/en/articles/2612315-can-i-use-unsplash-images-for-personal-or-commercial-projects
- Tour can be replayed from Settings → How to use PocketWise. Completion is stored in localStorage for this browser profile.

Run checks with:

```sh
node --check onboarding.js
node --check app.js
```
