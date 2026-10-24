/*
 * Vowella template catalogue.
 * To add a design: append an object to this array. Everything on the page
 * (gallery, preview dialog, links) is rendered from this data.
 *
 * Only list features that the invitation really has.
 */
window.VOWELLA_TEMPLATES = [
  {
    id: "s1",
    code: "S1",
    name: "Ivory & Maroon",
    sample: "Aarav & Meera",
    tagline: "A tap-to-open invitation for a Kerala wedding.",
    description:
      "Opens with a single tap, then unfolds as a quiet scroll: a live countdown, the story of the day, each ceremony with add-to-calendar, and the venue one tap from directions.",
    features: ["Tap to open", "Live countdown", "Events & calendar", "Venue directions"],
    // The real, live invitation. Keep absolute so it resolves wherever Vowella is hosted.
    url: "https://nithan.in/S1",
    accent: "#6e1f2b"
  }
];
