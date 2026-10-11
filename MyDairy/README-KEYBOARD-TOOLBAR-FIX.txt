Quiet Pages: keyboard toolbar + title input repair (v15)

Fixes in this update:
- The entry title input is never hidden by keyboard CSS, so it stays focusable and typeable. Scroll back to it whenever needed.
- Removed the MutationObserver-based focus rebinding that repeatedly attached duplicate handlers as contenteditable changed.
- Replaced the fragile calculated toolbar top position with a bottom inset derived from the hidden layout-viewport height, using VisualViewport height only (not offsetTop, which can be stale or change during iOS caret panning).
- Disabled the editor screen’s fill-mode translate animation while writing: a transformed ancestor was causing `position: fixed` to behave as if it were fixed to the page section, not the screen. This was the key reason the toolbar drifted during scrolling.
- Updates the inset on VisualViewport resize/scroll, page scroll, window resize, orientation changes, and pageshow.
- Resets the inset after keyboard dismissal, including the stale VisualViewport offset seen in some iOS Safari releases.
- Navigation remains hidden while the keyboard is active; the regular layout returns when editing focus/keyboard closes.
- Bumped the service-worker cache name so GitHub Pages clients can retrieve the updated files.

Deploy safely:
1. Export a backup from Quiet Pages Settings before replacing files.
2. Extract this ZIP and copy the matching files into the ROOT of your existing GitHub Pages repository, replacing those files only. Preserve other project files, assets, and the repository.
3. Commit/push; then reopen the site. If an old version persists, close the PWA/Safari tab and reopen it after the service worker activates. Do not clear browser storage.

Phone validation checklist:
- Open an entry: the title remains visible when its field has focus and accepts typing.
- Tap the body: the title remains available in the document, and the formatting bar appears immediately above the keyboard.
- Scroll a long entry with the keyboard open: the bar remains anchored above the keyboard.
- Tap Bold/Heading/Quote, type again, and verify formatting applies at the selection.
- Dismiss the keyboard: the bar hides and navigation returns.

Validation performed here: JavaScript syntax and ZIP integrity. Physical iPhone Safari validation has not been performed in this environment.


V16 structural repair: the formatting toolbar is moved to a direct child of document.body while the editor is mounted. This avoids fixed-position elements being constrained by the screen/app-shell containing block on iOS. The toolbar is placed above the software keyboard using the viewport inset, and removed when leaving the editor. The title is no longer auto-focused during the screen transition, so the user can deliberately tap the title field without the keyboard opening mid-transition.

Validation note: source syntax and ZIP integrity are checked; this cannot substitute for a physical iPhone Safari test.
