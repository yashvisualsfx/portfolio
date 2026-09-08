/*
  Harsh's work, grouped by discipline.

  Each category carries a `layout` telling the section which component renders
  it:

    cinema  — fullscreen scroll scenes, one piece at a time
    grid    — many stills read together
    rail    — pieces moving horizontally through depth

  Aspect is NOT declared here. It comes from the media manifest per item,
  because a category is not reliably one shape: product animation mixes 9:16
  social cuts with a 16:9 spot, and a layout that assumed otherwise would
  letterbox half of them. Components read `getMedia(item.media).aspectRatio`
  (or the `orientation` helper) and compose per piece. `fallbackAspect` only
  covers frames drawn before any media exists.

  Categories with no filled media stay here as pending rather than being
  deleted; `activeCategories` filters them out so the site never renders an
  empty section, and a category lights up on its own as soon as work lands.

  Titles are taken from each piece's own on-screen text or its subject.
  Client fields are TBC pending confirmation of what was client work and what
  was made as a concept piece.
*/

export const ASPECT = {
  landscape: 16 / 9,
  portrait: 9 / 16,
};

export const workCategories = [
  {
    id: "product-animation",
    index: "01",
    label: "Product Animation",
    heading: ["Product", "Animation"],
    summary:
      "Motion built to sell a product — staged reveals, controlled lighting and camera moves that keep the object the subject.",
    layout: "cinema",
    fallbackAspect: ASPECT.landscape,
    items: [
      {
        id: "pa-boat",
        index: "01",
        title: "boAt Headphones",
        client: "Client TBC",
        year: "2025",
        description:
          "Product spot cut against a hard red-and-white grid — the headphones hold centre while the graphics move around them.",
        alt: "Frame from a product animation: black over-ear headphones centred on a split red and white background with graphic marks.",
        media: { type: "video", key: "product-animation-02" },
      },
      {
        id: "pa-organic-cream",
        index: "02",
        title: "Organic Cream",
        client: "Client TBC",
        year: "2025",
        description:
          "Vertical skincare reveal — podium staging, gold and green palette, the lid lifting to open the shot.",
        alt: "Frame from a product animation: a green and gold organic cream jar on a podium framed by palm leaves.",
        media: { type: "video", key: "product-animation-01" },
      },
      {
        id: "pa-juice",
        index: "03",
        title: "Orange Juice",
        client: "Client TBC",
        year: "2025",
        description:
          "Beverage spot for vertical feeds — high-saturation colour and a slow turn that keeps the label readable throughout.",
        alt: "Frame from a product animation: an orange juice bottle with a citrus-slice label against a bright green background.",
        media: { type: "video", key: "product-animation-03" },
      },
    ],
  },
  {
    id: "motion-graphics",
    index: "02",
    label: "Motion Graphics",
    heading: ["Long-Form", "Motion"],
    summary:
      "Animated explainers that carry a whole idea — character work, kinetic typography and transitions cut to hold attention across the full runtime.",
    layout: "cinema",
    fallbackAspect: ASPECT.landscape,
    items: [
      {
        id: "mg-storing",
        index: "01",
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
    id: "shorts",
    index: "03",
    label: "Reels & Shorts",
    heading: ["Reels", "& Shorts"],
    summary:
      "Vertical-first edits cut for the feed — fast hooks, kinetic titling and pacing that earns the next second.",
    layout: "rail",
    fallbackAspect: ASPECT.portrait,
    items: [
      {
        id: "reel-brands",
        index: "01",
        title: "Most Brands Don't",
        client: "Client TBC",
        year: "2025",
        description:
          "Editorial monochrome explainer on why brands lose sales — type-led, with graphic marks carrying the rhythm.",
        alt: "Frame from a vertical reel: bold headline 'Most Brands Don't' over a light grey editorial layout with a barcode motif.",
        media: { type: "video", key: "reel-short-01" },
      },
      {
        id: "reel-profile",
        index: "02",
        title: "Akshaye Khanna",
        client: "Client TBC",
        year: "2025",
        description:
          "Film-profile reel built as a moving editorial spread — cut-out portrait, hard bands and typeset biography.",
        alt: "Frame from a vertical reel: black and white portrait of an actor over a monochrome editorial layout with a typeset biography.",
        media: { type: "video", key: "reel-short-02" },
      },
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
    fallbackAspect: ASPECT.landscape,
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

  // ---- Pending: structure is ready, waiting on files ----
  {
    id: "documentary",
    index: "05",
    label: "Documentary",
    heading: ["Documentary", "Films"],
    summary:
      "Long-form storytelling — pacing, structure and colour built around the subject rather than the edit.",
    layout: "cinema",
    fallbackAspect: ASPECT.landscape,
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
  portrait: { type: "image", key: "harsh-portrait" },
  portraitMotion: null, // its motion counterpart, if there is one
};
