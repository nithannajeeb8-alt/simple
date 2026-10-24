# Vowella design notes · second art direction pass

## Intent

The direction is romantic and editorial rather than a stock wedding-builder theme. A softly blurred botanical hedge sets the mood; the couple arrives as a transparent foreground layer; a restrained display serif gives the name its own identity; and the supporting italic type feels softer and more intimate. The story section stays on paper tones, wine is saved for the emotional interlude, marine blue frames the invitation collection and footer, and gold is used sparingly as a detail.

The two assets that looked like tilted white photographs were changed to transparent overlays: `botanical-blue-cutout.webp` and `champagne-butterfly-trim.webp`. The originals remain in `assets/` alongside the transparent companions. The cut-outs are cropped to the visible artwork so their transparent padding no longer creates odd image placement or oversized boxes.

## Layout and hierarchy

- Story copy comes first; the botanical still life sits in a separate, shorter stage underneath it, with the bouquet grounded to the left, the butterfly occupying the open upper-right, and a small caption in the space between them.
- The wine interlude uses a fine inset line and only two corner illustrations, allowing the central statement to remain dominant.
- The invitation gallery uses a perspective stage: the live invitation is centered and straight-on while neighbouring concepts sit slightly smaller, rotated inward and set back in depth. This follows the core mechanics of classic Cover Flow rather than scattering tilted images.
- The centre card is explicitly the only live invite. Future concepts remain labelled as works in progress.
- The creator's still-life uses the swan, mirror and birds as one composition. The final burgundy detail is shorter, so it reads as a pause rather than a second oversized full-screen block.
- Each decorative asset has a semantic role and a defined placement. Slow, low-amplitude drift is used for atmosphere; the main type and invitation remain the point of focus.

## Research that informed the update

- **Nithan.in** — reference for the cinematic image reveal, typography, and long-form editorial pacing: <https://nithan.in/>
- **Vowella S1** — the real existing invitation preview: <https://nithan.in/S1>
- **Riley & Grey** — curated wedding-site templates and clear separation between choosing a design and reviewing what a website can do: <https://www.rileygrey.com/wedding-website-templates>
- **Bliss & Bone** — art-directed wedding-site examples, including botanical and moody photographic treatments: <https://blissandbone.com/wedding-website/audrey-wedding-website>
- **Nielsen Norman Group, Visual Design Principles** — scale, hierarchy, balance, contrast and grouping help establish a clear focus: <https://www.nngroup.com/articles/principles-visual-design/>
- **Nielsen Norman Group, Visual Hierarchy** — proximity and whitespace are key to communicating what belongs together and what deserves attention: <https://www.nngroup.com/articles/visual-hierarchy-ux-definition/>
- **Swiper API, Coverflow effect** — the established parameters are rotation, depth, scale, stretch and slide shadows: <https://swiperjs.com/swiper-api>
- **MDN, CSS performance** — prefer efficient transform/opacity motion and avoid excessive animation: <https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS>
- **MDN, accessibility media queries** — respect the user's `prefers-reduced-motion` preference: <https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility>

## Avoiding generic AI-site patterns

- No repetitive three-column feature-card grid or a stack of identical rounded cards.
- No fake testimonials, invented template counts, fabricated email addresses or unsupported claims about payment, editor, account or RSVP functionality.
- Typography, composition and colour rhythm change by section, while related elements stay grouped and consistent.
- The main focal point is unmistakable: Vowella's name in the hero and the single live invitation in the gallery.
- Colour is restrained rather than making every section equally loud. Gold is an accent, and whitespace is treated as part of the composition.
- Motion is subtle, has low amplitude and is removed for people who ask their device to reduce motion.

## Implementation notes

The page uses plain HTML, CSS and JavaScript. The gallery is self-contained and does not add a framework or slider dependency. It supports arrows, pagination dots, keyboard navigation and touch swipes. All major content remains readable if custom web fonts are unavailable.
