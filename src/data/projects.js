/*
  Harsh's work, in the order the site tells it.

  Titles and copy below are placeholders standing in for real projects, and
  every `media` slot is null until Harsh's own assets are added to the repo.
  Components treat a null slot as "render the frame, not the fill", so the
  scroll scenes compose correctly while the art is still pending.

  To wire real work: drop the files into images/ posters/ videos/, run
  `npm run media`, then point each `media` at the generated manifest key —
  e.g. `{ type: "video", key: "opening-film" }`.

  Ordering logic — Selected Work alternates motion and still pieces so each
  fullscreen scene changes rhythm against the one before it.
*/

export const projects = [
  {
    id: "brand-identity",
    index: "01",
    title: "Brand Identity",
    subtitle: "Project title TBC",
    category: "Brand Identity",
    discipline: "Graphic Design",
    year: "2026",
    tools: ["Illustrator", "Photoshop"],
    description: "Placeholder — replace with the project's own story.",
    media: null,
  },
  {
    id: "motion-design",
    index: "02",
    title: "Motion Design",
    subtitle: "Project title TBC",
    category: "Motion Graphics",
    discipline: "Motion Design",
    year: "2026",
    tools: ["After Effects"],
    description: "Placeholder — replace with the project's own story.",
    media: null,
  },
  {
    id: "ux-experience",
    index: "03",
    title: "UI / UX",
    subtitle: "Project title TBC",
    category: "Digital Experience",
    discipline: "Product Design",
    year: "2026",
    tools: ["Figma"],
    description: "Placeholder — replace with the project's own story.",
    media: null,
  },
  {
    id: "three-d-visual",
    index: "04",
    title: "3D Visual",
    subtitle: "Project title TBC",
    category: "3D Visual",
    discipline: "3D",
    year: "2026",
    tools: ["Blender"],
    description: "Placeholder — replace with the project's own story.",
    media: null,
  },
  {
    id: "film",
    index: "05",
    title: "Film / Video",
    subtitle: "Project title TBC",
    category: "Film",
    discipline: "Video Editing",
    year: "2026",
    tools: ["Premiere Pro"],
    description: "Placeholder — replace with the project's own story.",
    media: null,
  },
  {
    id: "experimental",
    index: "06",
    title: "Experimental",
    subtitle: "Project title TBC",
    category: "Experimental",
    discipline: "Creative Direction",
    year: "2026",
    tools: ["Mixed"],
    description: "Placeholder — replace with the project's own story.",
    media: null,
  },
];

// Horizontal gallery — a set of pieces that read together, given their own
// depth-staged horizontal scroll rather than another fullscreen scene.
export const galleryPanels = [
  { id: "panel-01", index: "01", title: "Project 01", caption: "Caption TBC", category: "Category TBC", media: null },
  { id: "panel-02", index: "02", title: "Project 02", caption: "Caption TBC", category: "Category TBC", media: null },
  { id: "panel-03", index: "03", title: "Project 03", caption: "Caption TBC", category: "Category TBC", media: null },
  { id: "panel-04", index: "04", title: "Project 04", caption: "Caption TBC", category: "Category TBC", media: null },
];

// Assets reserved for specific scenes rather than the work grids.
export const sceneMedia = {
  experimental: null, // drives the experimental 3D break
  portrait: null, // About section portrait
  portraitMotion: null, // its motion counterpart, if there is one
};
