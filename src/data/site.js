/*
  Single source of truth for identity, navigation and contact.

  Social URLs are stored clean — no share tokens, no utm parameters. The links
  as shared from the apps carried both (Instagram's `stkn` is a personal share
  token from a QR code; LinkedIn's utm block just records that it came from
  the iOS share sheet). Neither belongs on a public page: they add nothing for
  a visitor, and the token is tied to one share rather than the profile.

  Channels still without real details are marked `pending` rather than given a
  dead "#" link — the contact section renders only what resolves, so nothing
  ships pointing nowhere.
*/

export const site = {
  name: "HARSH",
  role: "Creative Designer",
  tagline: "Building visual experiences through design, motion & technology.",
  intro:
    "I'm Harsh. I make things people actually finish watching — motion graphics, product animation, long-form edits, and the thumbnails that earn the click in the first place.",

  location: "Gurgaon, India",
  // TODO(harsh): experience line, and an email address for the primary CTA
  experience: "Experience — TBC",
  availability: "Available for select projects — 2026",
  email: null,
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

/*
  WhatsApp is the direct line, so it leads and becomes the primary CTA while
  there is no email address.

  The number is never shown as text — the handle reads "Message on WhatsApp".
  It does still appear inside the href, because a click-to-chat link cannot
  work without it; that is inherent to wa.me rather than something this file
  chooses. The pre-filled text means an enquiry arrives with context already
  attached instead of a cold "hi".
*/
const WHATSAPP_NUMBER = "917755061249";
const WHATSAPP_MESSAGE = "Hi, I saw your portfolio, and I'd like to connect with you.";

const allChannels = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
    handle: "Message on WhatsApp",
    icon: "whatsapp",
  },
  site.email
    ? { label: "Email", href: `mailto:${site.email}`, handle: site.email }
    : { label: "Email", pending: true },
  {
    label: "Instagram",
    href: "https://www.instagram.com/har5h.fx",
    handle: "@har5h.fx",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/harsh-kushwaha-124273365",
    handle: "Harsh Kushwaha",
  },
  // TODO(harsh): Behance profile URL
  { label: "Behance", pending: true },
];

/** Only the channels that actually resolve — what the site renders. */
export const socials = allChannels.filter((channel) => channel.href);

/** What is still missing, so it is visible in the data rather than only here. */
export const pendingChannels = allChannels.filter((channel) => channel.pending);

/**
 * Where the primary "Start a project" CTA points. Email when there is one,
 * otherwise the first channel that does resolve — a CTA that goes nowhere is
 * worse than one that goes somewhere unexpected.
 */
export const primaryContact = socials[0] ?? null;

// TODO(harsh): confirm the toolset this portfolio should claim.
export const tools = ["After Effects", "Premiere Pro", "Photoshop", "Illustrator", "Figma"];

export const marqueeWords = ["DESIGN", "MOTION", "3D", "DIGITAL", "EXPERIENCE"];
