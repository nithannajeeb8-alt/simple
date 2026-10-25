# Vowella Website

A responsive, static website built from the supplied Vowella artwork. No build tools, package installation, or JavaScript framework are required.

## Publish on GitHub Pages

1. Extract the ZIP.
2. Upload the contents of this folder to the root of your GitHub repository, keeping `index.html` at the repository root.
3. In GitHub, open **Settings → Pages**, select **Deploy from a branch**, choose the branch and `/ (root)`, then save.

## Layout details

- The opening hero is layered from the hedge, live wordmark, transparent couple cutout, SVG paper curve, and rings asset. The couple rises into view on load, with reduced-motion support.
- The story section uses a handwritten quote and signature, with the floral detail crossing the divider without being cut off.
- The upcoming invitation Cover Flow is intentionally not linked to products. Desktop uses a layered fan; mobile uses a native horizontal, snap-scrolling rail centered on the featured red invitation. Cards have consistent rounded edges and shadows.
- Template previews use rounded image frames. All major sections and the closing hands panel run edge-to-edge, without outer white gutters or dotted page margins.
- The closing panel layers the original photo and transparent hands at the same size and position. The brand wordmark, tagline, birds, and connect label remain separate elements.

## Typography

The supplied archive contains font-reference screenshots, not installable font files. The website uses **Libre Bodoni** for the high-contrast wordmark, **Manrope** for supporting typography, and **Caveat** for handwritten copy and the Vowella signature. These fonts are loaded from Google Fonts; an internet connection is required for the exact font rendering. Local fallback fonts are provided.

## Files

- `index.html` — sections, copy, and accessible markup
- `styles.css` — responsive layout, layered hero, cover flow, and typography
- `script.js` — centers the featured card in the mobile cover flow
- `assets/` — optimized image assets used by the website
