/*
  Single source of truth for identity, navigation and contact.

  Every contact value below is a PLACEHOLDER awaiting Harsh's real details —
  nothing here is carried over from any previous site. Replace the marked
  fields before this goes live.
*/

export const site = {
  name: "HARSH",
  role: "Creative Designer",
  tagline: "Building visual experiences through design, motion & technology.",
  intro:
    "I'm Harsh. I make things people actually finish watching — motion graphics, product animation, long-form edits, and the thumbnails that earn the click in the first place.",

  // TODO(harsh): replace placeholders with real details
  location: "Location — TBC",
  experience: "Experience — TBC",
  availability: "Available for select projects — 2026",
  email: "hello@example.com",
  year: "2026",
};

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// The fullscreen menu (Phase 8) reaches each discipline directly; the top bar
// stays at three items so it keeps its restraint. Kept in step with the
// categories that have work — add entries as pending categories fill up.
export const menuLinks = [
  { label: "Product Animation", href: "#product-animation" },
  { label: "Motion Graphics", href: "#motion-graphics" },
  { label: "Reels & Shorts", href: "#shorts" },
  { label: "Thumbnails", href: "#thumbnails" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// TODO(harsh): replace every href/handle with Harsh's real accounts.
export const socials = [
  { label: "Email", href: `mailto:${site.email}`, handle: site.email },
  { label: "Instagram", href: "#", handle: "@handle" },
  { label: "Behance", href: "#", handle: "Behance" },
  { label: "LinkedIn", href: "#", handle: "LinkedIn" },
];

// TODO(harsh): confirm the toolset this portfolio should claim.
export const tools = ["After Effects", "Premiere Pro", "Photoshop", "Illustrator", "Figma"];

export const marqueeWords = ["DESIGN", "MOTION", "3D", "DIGITAL", "EXPERIENCE"];
