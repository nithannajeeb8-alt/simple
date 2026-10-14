# Little Days responsive layout and spacing system

This project uses Apple Human Interface Guidelines as a reference for principles, not as a claim that a website is a native iOS app.

## Principles applied
- Adapt content to viewport size; don't lock layout to a single screenshot.
- Respect safe-area insets around top and bottom browser/system UI.
- Use readable text, aligned content edges, consistent spacing and familiar controls.
- Use appearance-specific dark palettes for surfaces, text, inputs, selected states, and navigation; do not merely recolour the page background.
- Keep touch controls at least 44 CSS px high as a practical mobile target.
- Reduce nonessential motion when the operating system requests reduced motion.

## Project spacing tokens
The CSS uses a compact 4/8-point-inspired scale: 4, 8, 12, 16, 20, 24, 32, and 40 CSS pixels. This is a project convention, not a prescribed Apple spacing scale. Main content gutters are responsive, and the reading column is capped on wide screens to avoid overly long lines.

## Official references
- Apple Human Interface Guidelines — Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Apple Human Interface Guidelines — Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode
- Apple SwiftUI — Layout adjustments, padding, margins, and safe areas: https://developer.apple.com/documentation/swiftui/layout-adjustments

## Scope
These are responsive HTML/CSS adaptations of Apple’s general layout principles. SwiftUI/Auto Layout APIs themselves are native-platform APIs and are not used in this browser-based project. Check layouts in Safari at multiple viewport sizes and with text zoom before production deployment.
