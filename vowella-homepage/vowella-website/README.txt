VOWELLA - REBUILD
=================

Replace index.html, styles.css and script.js in your vowella-website folder.
Keep your existing assets folder (same file names as before, nothing renamed).
New folder? Run Setup-Assets.bat to pull the original images first.

STRUCTURE (each section is its own block with its own spacing)
1 Hero         hedge > wordmark > couple > curved dome
2 Story        rings, quote, message, signature, green line + blue flowers
3 Cover flow   fanned cards (drag, click, arrow keys, slow autoplay), lavender line + butterfly
4 Templates    Floral Red / Minimalist / Stylist, then "view more"
5 Closing      photo > wordmark + tagline > transparent hands > Let's connect

TUNING (top of styles.css, in :root)
--couple-h    height of the couple cut-out (raise it if the couple sits too low)
--title-top   how far from the top the eyebrow + wordmark start
--space-section, --pad-x   vertical and horizontal breathing room

TO FINISH
- Preview links: Floral Red points to https://nithan.in/S1. Set the other two in index.html.
- "Let's connect": replace href="#contact" with your mailto or WhatsApp link.
- Cover flow order: edit the five <figure class="flow-card"> lines; the third opens centred.

Fonts load from Google Fonts, so open the page online the first time.
