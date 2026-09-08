/*
  Harsh's work, grouped by discipline.

  The categories don't want the same treatment — a 16:9 explainer and a 9:16
  reel fight each other in one layout — so each carries a `layout` that tells
  the section which component renders it, and an `aspect` so frames reserve
  the right shape before any media exists:

    cinema  — fullscreen scroll scenes, one piece at a time, 16:9
    grid    — many stills read together, 16:9
    rail    — vertical pieces moving horizontally through depth, 9:16

  Categories with no filled media are kept here as pending rather than
  deleted; `activeCategories` filters them out so the site never renders an
  empty section, and a category lights up on its own as soon as work lands in
  it. Titles marked TBC are placeholders for Harsh to confirm.

  To wire real work: drop files into images/ posters/ videos/, run
  `npm run media`, then point a slot at the generated key.
*/

export const ASPECT = {
  landscape: 16 / 9,
  portrait: 9 / 16,
};

export const workCategories = [
  {
    id: "motion-graphics",
    index: "01",
    label: "Motion Graphics",
    heading: ["Long-Form", "Motion"],
    summary:
      "Animated explainers that carry a whole idea — character work, kinetic typography and transitions cut to hold attention across the full runtime.",
    layout: "cinema",
    aspect: ASPECT.landscape,
    items: [
      {
        id: "mg-storing",
        index: "01",
        // Titles taken from the pieces' own on-screen text.
        title: "Storing 1s & 0s",
        client: "Channel TBC",
        year: "2025",
        description:
          "Character-led explainer tracing how data gets stored, built as one continuous animated sequence.",
        alt: "Frame from an animated explainer: a presenter character beside a desktop computer under the title 'Assembly Era'.",
        media: { type: "video", key: "motion-graphics-01" },
      },
      {
        id: "mg-tenth-habit",
        index: "02",
        title: "10th Habit",
        client: "Channel TBC",
        year: "2025",
        description:
          "Title and graphics package over live footage, timed to the edit rather than dropped on top of it.",
        alt: "Frame from a motion graphics piece: animated title '10th Habit' over a trading desk of monitors.",
        media: { type: "video", key: "motion-graphics-02" },
      },
    ],
  },
  {
    id: "thumbnails",
    index: "02",
    label: "Thumbnails",
    heading: ["Thumb", "Nails"],
    summary:
      "The first frame anyone sees — composition, contrast and type built to win the click at any size.",
    layout: "grid",
    aspect: ASPECT.landscape,
    items: [
      {
        id: "thumb-shopify",
        index: "01",
        title: "24 Hours",
        client: "Channel TBC",
        year: "2025",
        description: "E-commerce results thumbnail — the number carries the frame, everything else supports it.",
        alt: "Thumbnail: a laptop showing a rising revenue graph reading $7,250, headline '#24 Hours', presenter pointing at the screen.",
        media: { type: "image", key: "24-hours-shopify" },
      },
      {
        id: "thumb-canva",
        index: "02",
        title: "10x Faster Reels",
        client: "Channel TBC",
        year: "2025",
        description: "Tutorial thumbnail — a single before-and-after gesture doing the explaining.",
        alt: "Thumbnail: headline 'Create Reels 10x Times Faster' with a Canva app icon held in an open hand above a rising chart.",
        media: { type: "image", key: "canva-reels-10x" },
      },
      {
        id: "thumb-interview",
        index: "03",
        title: "I Am Not A Chor",
        client: "Channel TBC",
        year: "2025",
        description: "Long-form interview thumbnail — quote as headline, subject and context staged behind it.",
        alt: "Thumbnail: headline 'I Am Not A Chor — Exclusive' over a portrait of an interview subject, with an aircraft in the background.",
        media: { type: "image", key: "i-am-not-a-chor" },
      },
    ],
  },

  // ---- Pending: structure is ready, waiting on Harsh's files ----
  {
    id: "documentary",
    index: "03",
    label: "Documentary",
    heading: ["Documentary", "Films"],
    summary:
      "Long-form storytelling — pacing, structure and colour built around the subject rather than the edit.",
    layout: "cinema",
    aspect: ASPECT.landscape,
    items: [],
  },
  {
    id: "product-animation",
    index: "04",
    label: "Product Animation",
    heading: ["Product", "Animation"],
    summary:
      "Motion built to sell a product — staged reveals, controlled lighting and transitions with weight.",
    layout: "cinema",
    aspect: ASPECT.landscape,
    items: [],
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
    items: [],
  },
];

/** Only the categories that actually have work — what the site renders. */
export const activeCategories = workCategories.filter((category) =>
  category.items.some((item) => item.media),
);

/** Flattened, for anything that needs to count or preload across categories. */
export const allWork = activeCategories.flatMap((category) =>
  category.items.map((item) => ({ ...item, category: category.label, categoryId: category.id })),
);

// Assets reserved for specific scenes rather than the work sections.
export const sceneMedia = {
  experimental: null, // drives the experimental 3D break
  portrait: null, // About section portrait
  portraitMotion: null, // its motion counterpart, if there is one
};
