# Little Days — Design system

This is a web implementation informed by Apple's Human Interface Guidelines, not a native iOS interface. The principles are adapted to responsive HTML/CSS: clear grouping, consistent alignment, safe-area support, compact progressive disclosure, readable controls, and semantic colour tokens.

## References

- Apple HIG — Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Apple HIG — Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode
- Apple HIG — Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Apple HIG — Text fields: https://developer.apple.com/design/human-interface-guidelines/text-fields
- Apple HIG — App icons: https://developer.apple.com/design/human-interface-guidelines/app-icons

## Layout rules

- One spacing scale: 4, 8, 12, 16, 20, 24, 32 and 40 CSS pixels. This is a project choice inspired by consistency, not an Apple-mandated scale.
- Content is capped at 1180 CSS pixels on wide screens; phone layouts use 12–16 CSS pixel page gutters.
- Sidebar navigation becomes a four-item bottom bar on narrow screens.
- Main content and bottom navigation account for `env(safe-area-inset-*)`.
- Grid children, labels, cards and form fields use `min-width: 0`; form controls use `width: 100%` and `box-sizing: border-box` to prevent iOS time fields and long text from escaping their columns.
- Touch controls aim for at least 44 CSS pixels in their primary dimension where practical.
- Mobile inputs use 16px text to avoid Safari's automatic zoom-on-focus behaviour.
- The welcome experience is a full-screen first-run page with its own scroll container. It is not a translucent modal showing a zoomed background page underneath.

## Semantic colour system

All components use these variables instead of individual hand-coded theme colours:

- `--canvas`: page background
- `--surface`, `--surface-raised`, `--surface-soft`: stacked surface levels
- `--text`, `--text-secondary`, `--text-tertiary`: text hierarchy
- `--line`: borders and separators
- `--accent`, `--accent-strong`, `--accent-soft`, `--accent-on`: action and selection colours
- `--focus`: keyboard focus indicator

Themes: Sky, Coral, Mint, Lavender, Dynamic, Midnight, Plum, Mulberry and Sage Forest. Every component, including Discover cards, native form controls, selection states, the bottom bar, prayer cards, dialogs and onboarding, inherits the same semantic surface variables. Feature categories may affect small icon accents, but not change the card body to a pale background with low-contrast lettering.

## App icon

The PWA icon is a small original SVG illustration: a single sunrise arc and three rays above a horizon. The same simple mark is exported to square PNG and Apple Touch Icon sizes. It uses large filled shapes, a solid background, centered content and no text, matching Apple's general advice to keep app icons simple and legible at small sizes. PNG files are generated locally from the same SVG so the site does not depend on an unrelated third-party icon asset.

## Accessibility and privacy

- Visible focus indicators, semantic labels, and responsive text-size controls are included.
- `prefers-reduced-motion` and the app's own Reduce Motion setting reduce animation.
- Contrast is intended to meet readable UI expectations, but this project has not had a full WCAG contrast audit or assistive-technology audit. Review all combinations before production.
- Profile details are optional and kept in this browser's localStorage. This is not encrypted storage. Online API features send relevant queries or location strings to their respective providers.


## Release/cache behavior

CSS and JavaScript are versioned in `index.html`; the theme-system release increments the service-worker cache to v12 to replace the old cached shell on activation. Navigation is network-first with an offline fallback, while versioned app assets are cached for offline use.


## Appearance themes

The theme selector includes Sky, Coral, Mint, Lavender, Dynamic, Midnight, Plum, Mulberry, and Sage Forest. Palette and appearance mode are independent. System follows the device preference; Light and Dark override it. Every palette has tuned light and dark surface, text, border, control, and accent tokens. Mulberry keeps a rich berry identity in both modes, and Sage Forest remains botanical in both modes. Dynamic rotates across all palettes while respecting the chosen appearance mode.
