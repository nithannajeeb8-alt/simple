# Radial balance gauge fix

- Outer money arc now uses the exact proportional shares of income and expenses across a 100-unit path.
- Equal income and expenses (net ₹0) render as 50% green and 50% red, meeting at the exact midpoint.
- Positive and negative periods both remain proportional; the loss state no longer incorrectly paints the entire arc red.
- Empty periods keep both colored strokes hidden, leaving the neutral track.
- Inner elapsed-days arc remains independent and uses current day / days in month.
- Service worker cache bumped to v1.3.8.

Validation: `node --check app.js`, `node tests/outer-arc.test.cjs`, and `node tests/quickadd-shortcut.test.cjs`.
