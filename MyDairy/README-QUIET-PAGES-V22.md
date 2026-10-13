# Quiet Pages v22

This is a PWA-only package based on the v21 notifications build. It preserves the existing project and local database/storage keys.

## Included
- First-run privacy explainer with clear limits: local browser storage is not encryption; browser storage can be cleared; optional model/runtime and external fonts/icons can be downloaded from providers.
- 50 original motivational quotes for notifications. Notification text never includes diary entries.
- User-controlled notification permission, daily time setting, and test notification.
- Editable scrapbook sticky notes in five pastel colours, inserted directly into diary text and retained by the rich-text sanitizer/autosave.
- Existing sticker and divider controls, themes, photos, backup/export and editor behavior retained.
- Updated service-worker cache version.

## Important notification limitation
This version checks the scheduled reminder while Quiet Pages is open. It does not reliably send scheduled notifications while the PWA is fully closed. Reliable closed-app scheduled delivery needs a push service/server, which would change the privacy architecture.

## Install/update
Upload the contents of this ZIP to the same GitHub Pages project, replacing the matching project files. Keep your existing origin/path. Before replacing anything, export a backup from Settings. After deployment, close and reopen the PWA; if it shows old assets, reload once or remove the old site cache.

## Validation
JavaScript syntax, manifest JSON, HTML parser and ZIP integrity checks passed. This package has not been physically tested on an iPhone or Android device.
