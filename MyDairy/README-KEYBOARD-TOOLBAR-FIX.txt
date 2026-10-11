Quiet Pages: scroll-direction formatting toolbar (v17)

Fixes in this update:
- Replaced the always-follow-the-keyboard toolbar behavior with a scroll-direction interaction.
- When body editing begins, the toolbar is shown at a stable top-of-viewport position. Scrolling down about 14 px hides it; scrolling up about 9 px reveals it again.
- The toolbar is portaled to a direct child of document.body so it does not inherit the editor screen's scrolling/transform containing block.
- Scroll events control visibility only. JavaScript does not continuously change the toolbar's top/bottom position in response to VisualViewport events.
- Toolbar clicks keep it visible while formatting; subsequent downward scrolling can hide it again.
- The title is not auto-focused during the editor transition, preserving deliberate title editing.
- Existing keyboard layout behavior still hides app navigation while the keyboard is open. Existing entry content, selection/range handling, editor features, and theme are preserved.
- Bumped the service-worker cache name so GitHub Pages clients can retrieve the updated files.

Deploy safely:
1. Export a backup from Quiet Pages Settings before replacing files.
2. Extract this ZIP and copy the matching files into the ROOT of your existing GitHub Pages repository, replacing those files only. Preserve other project files, assets, and the repository.
3. Commit/push; then reopen the site. If an old version persists, close the PWA/Safari tab and reopen it after the service worker activates. Do not clear browser storage.

Phone validation checklist:
- Open an entry: the title remains visible when its field has focus and accepts typing.
- Tap the body: the formatting bar appears near the top of the viewport.
- Scroll downward: the bar hides after the configured threshold. Scroll upward: it reappears after a small movement.
- Tap Bold/Heading/Quote, type again, and verify formatting applies at the selection.
- Verify toolbar stays still during typing, title is editable, and navigation returns after keyboard dismissal.

Validation performed here: JavaScript syntax and ZIP integrity. Physical iPhone Safari validation has not been performed in this environment.


V16 structural repair: the formatting toolbar is moved to a direct child of document.body while the editor is mounted. This avoids fixed-position elements being constrained by the screen/app-shell containing block on iOS. The toolbar is placed above the software keyboard using the viewport inset, and removed when leaving the editor. The title is no longer auto-focused during the screen transition, so the user can deliberately tap the title field without the keyboard opening mid-transition.

Validation note: source syntax and ZIP integrity are checked; this cannot substitute for a physical iPhone Safari test.
