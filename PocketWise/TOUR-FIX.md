# PocketWise onboarding spotlight precision fix

- The balance step now highlights `.money-card .radial-area`, not the entire `.money-card`.
- The tour card is dynamically placed above or below the target based on available viewport space, so it no longer sits over the highlighted feature by default.
- Spotlight and dialog have explicit stacked layers. The spotlight cutout remains transparent while the scrim dims the surrounding interface.
- On narrow or short screens, the tour card scrolls within available space.
- The dimmed backdrop remains non-dismissible; progression uses Next / Finish, with Skip tour as an explicit exit.
- Service-worker cache version: `pocketwise-shell-v2.0.10`.

Validation: JavaScript syntax checks passed; 23 automated tests passed. Physical-device visual verification is still required.
