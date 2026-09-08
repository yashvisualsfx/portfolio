/*
  Capabilities, written to match the work the site actually shows rather than
  a generic agency list — each one maps onto a category in projects.js.

  `preview` is the piece of real work that appears on hover, so the section
  proves the claim instead of asserting it. Slots are null until Harsh's
  assets are added.
*/

export const skills = [
  {
    index: "01",
    title: "Motion Graphics",
    summary: "Animated explainers, kinetic typography and title packages with real weight.",
    preview: { type: "video", key: "motion-graphics-01" },
  },
  {
    index: "02",
    title: "Thumbnail Design",
    summary: "Composition, contrast and type that win the click at any size.",
    preview: { type: "image", key: "24-hours-shopify" },
  },
  {
    index: "03",
    title: "Long-Form Editing",
    summary: "Full-length edits engineered to hold attention to the end.",
    preview: { type: "video", key: "motion-graphics-02" },
  },
  {
    index: "04",
    title: "Short-Form / Reels",
    summary: "Vertical cuts with fast hooks and pacing native to the feed.",
    preview: { type: "video", key: "reel-short-01" },
  },
  {
    index: "05",
    title: "Documentary Editing",
    summary: "Structure, pacing and narrative flow for long-form storytelling.",
    preview: null,
  },
  {
    index: "06",
    title: "Product Animation",
    summary: "Staged reveals and motion built to make a product the subject.",
    preview: { type: "video", key: "product-animation-02" },
  },
  {
    index: "07",
    title: "Colour & Finish",
    summary: "Grading, sound design and the final pass that makes it feel made.",
    preview: null,
  },
];
