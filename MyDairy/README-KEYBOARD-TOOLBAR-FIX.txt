Quiet Pages: keyboard toolbar positioning fix

This update positions the rich-text toolbar using the current VisualViewport top and height, so its top edge is calculated relative to the visible area above the iOS keyboard rather than the full document bottom. It also keeps the navigation hidden while typing.

Deploy: back up your diary, extract these six files into the existing GitHub Pages site root, replacing matching files, then commit/push. Do not replace the repository or clear browser storage.

Test on iPhone Safari/PWA: open a diary entry, tap the body, verify toolbar sits immediately above keyboard; scroll long text while typing; tap formatting controls; dismiss keyboard and verify navigation returns. Physical-device validation is still required.
