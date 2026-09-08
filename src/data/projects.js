/*
  Harsh's work, grouped by discipline.

  The five categories don't want the same treatment — a 16:9 documentary cut
  and a 9:16 reel fight each other in one layout — so each carries a `layout`
  that tells the section which component renders it, and an `aspect` so frames
  reserve the right shape before any media exists:

    cinema  — fullscreen scroll scenes, one piece at a time, 16:9
    grid    — many stills read together, 16:9
    rail    — vertical pieces moving horizontally through depth, 9:16

  Titles and counts below are placeholders. Every `media` slot is null until
  Harsh's own files are added; components render the frame without the fill,
  so the scroll scenes compose correctly while artwork is pending.

  To wire real work: drop files into images/ posters/ videos/, run
  `npm run media`, then point a slot at the generated key —
  e.g. `media: { type: "video", key: "opening-film" }`.
*/

export const ASPECT = {
  landscape: 16 / 9,
  portrait: 9 / 16,
};

export const workCategories = [
  {
    id: "documentary",
    index: "01",
    label: "Documentary",
    heading: ["Documentary", "Films"],
    summary:
      "Long-form storytelling — pacing, structure and colour built around the subject rather than the edit.",
    layout: "cinema",
    aspect: ASPECT.landscape,
    items: [
      { id: "doc-01", index: "01", title: "Film title TBC", client: "Client TBC", year: "2026", media: null },
      { id: "doc-02", index: "02", title: "Film title TBC", client: "Client TBC", year: "2026", media: null },
    ],
  },
  {
    id: "product-animation",
    index: "02",
    label: "Product Animation",
    heading: ["Product", "Animation"],
    summary:
      "Motion built to sell a product — staged reveals, controlled lighting and transitions with weight.",
    layout: "cinema",
    aspect: ASPECT.landscape,
    items: [
      { id: "prod-01", index: "01", title: "Product TBC", client: "Client TBC", year: "2026", media: null },
      { id: "prod-02", index: "02", title: "Product TBC", client: "Client TBC", year: "2026", media: null },
    ],
  },
  {
    id: "youtube",
    index: "03",
    label: "YouTube",
    heading: ["Long", "Form"],
    summary:
      "Full-length edits engineered for retention — narrative flow, sound design and graphics that hold attention.",
    layout: "cinema",
    aspect: ASPECT.landscape,
    items: [
      { id: "yt-01", index: "01", title: "Video title TBC", client: "Channel TBC", year: "2026", media: null },
      { id: "yt-02", index: "02", title: "Video title TBC", client: "Channel TBC", year: "2026", media: null },
    ],
  },
  {
    id: "thumbnails",
    index: "04",
    label: "Thumbnails",
    heading: ["Thumb", "Nails"],
    summary:
      "The first frame anyone sees — composition, contrast and type built to win the click at any size.",
    layout: "grid",
    aspect: ASPECT.landscape,
    items: [
      { id: "thumb-01", index: "01", title: "Thumbnail TBC", client: "Channel TBC", year: "2026", media: null },
      { id: "thumb-02", index: "02", title: "Thumbnail TBC", client: "Channel TBC", year: "2026", media: null },
      { id: "thumb-03", index: "03", title: "Thumbnail TBC", client: "Channel TBC", year: "2026", media: null },
      { id: "thumb-04", index: "04", title: "Thumbnail TBC", client: "Channel TBC", year: "2026", media: null },
      { id: "thumb-05", index: "05", title: "Thumbnail TBC", client: "Channel TBC", year: "2026", media: null },
      { id: "thumb-06", index: "06", title: "Thumbnail TBC", client: "Channel TBC", year: "2026", media: null },
    ],
  },
  {
    id: "shorts",
    index: "05",
    label: "Reels & Shorts",
    heading: ["Reels", "& Shorts"],
    summary:
      "Vertical-first edits cut for the feed — fast hooks, kinetic titling and platform-native pacing.",
    layout: "rail",
    aspect: ASPECT.portrait,
    items: [
      { id: "short-01", index: "01", title: "Reel TBC", client: "Client TBC", year: "2026", media: null },
      { id: "short-02", index: "02", title: "Reel TBC", client: "Client TBC", year: "2026", media: null },
      { id: "short-03", index: "03", title: "Reel TBC", client: "Client TBC", year: "2026", media: null },
      { id: "short-04", index: "04", title: "Reel TBC", client: "Client TBC", year: "2026", media: null },
    ],
  },
];

/** Flattened, for anything that needs to count or preload across categories. */
export const allWork = workCategories.flatMap((category) =>
  category.items.map((item) => ({ ...item, category: category.label, categoryId: category.id })),
);

// Assets reserved for specific scenes rather than the work sections.
export const sceneMedia = {
  experimental: null, // drives the experimental 3D break
  portrait: null, // About section portrait
  portraitMotion: null, // its motion counterpart, if there is one
};
