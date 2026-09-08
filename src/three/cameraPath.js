import { easeSignature } from "../animations/easing.js";

/*
  The signature sequence, authored as a camera path rather than a pile of
  per-property tweens.

  Positions are offsets from the sculpture's centre, so the same path works
  wherever the composition places the form. The camera starts where the hero
  left it, closes on the band, passes through the gap in its middle, comes out
  behind it, and pulls back to frame the first work section.

  `at` values are the hero sequence's own 0..1 progress, driven by the pinned
  ScrollTrigger — so scrubbing the scrollbar scrubs the camera.
*/
export const CAMERA_PATH = [
  {
    at: 0,
    // Hero rest. Offset back and to the left of the form, which is what puts
    // it in the upper right of frame with the wordmark clear of it.
    position: [-1.5, -0.4, 6],
    lookAt: [-1.5, -0.4, 0],
  },
  {
    at: 0.32,
    // Closing in, and starting to look at the form rather than past it.
    position: [-0.7, -0.15, 3],
    lookAt: [0, 0, 0],
  },
  {
    at: 0.58,
    // Inside the band, looking through the far side of the ring.
    position: [0, 0.05, 0.35],
    lookAt: [0, 0, -2.5],
  },
  {
    at: 0.8,
    // Rising up out of the band and turning back to look down on it. The
    // camera goes through the middle and around rather than straight out the
    // far side: flying past would leave the form behind the lens and the
    // frame empty, and the turn needed to recover it would read as a whip.
    position: [0.6, 1.1, 0.2],
    lookAt: [0, 0, 0],
  },
  {
    at: 1,
    // High and wide, the form small and low in frame — a composed resting
    // shot for the work sections to sit against.
    position: [0.2, 1.9, 4.2],
    lookAt: [0, 0.1, 0],
  },
];

/*
  Object transform across the same 0..1. The band tightens as the camera
  approaches, opens out as it passes through, and the lighting rises with it —
  the "transformation" is a real change of form, not just a spin.
*/
export const FORM_PATH = [
  { at: 0, twist: 2, spin: 0, scale: 1, envIntensity: 2.4 },
  { at: 0.32, twist: 2.6, spin: 0.7, scale: 1.05, envIntensity: 3.1 },
  { at: 0.58, twist: 3.4, spin: 1.6, scale: 1.18, envIntensity: 3.8 },
  { at: 0.8, twist: 2.8, spin: 2.4, scale: 1.0, envIntensity: 2.6 },
  { at: 1, twist: 2, spin: 3.1, scale: 0.82, envIntensity: 2.1 },
];

/*
  The experimental break orbits the form instead of following keyframes — a
  circle is described exactly by an angle, and authoring one as waypoints
  would only approximate it. Half a turn across the section, rising slightly,
  so the silhouette changes continuously behind the overlay type.
*/
export function sampleOrbit(t, outPosition, outLookAt) {
  const angle = -Math.PI * 0.35 + t * Math.PI;
  const radius = 4.6;

  outPosition.set(
    Math.sin(angle) * radius,
    0.6 + Math.sin(t * Math.PI) * 1.1,
    Math.cos(angle) * radius,
  );
  outLookAt.set(0, 0, 0);
}

/*
  The finale: the world coming to rest. A wide, slightly-above framing with
  the form centred — settled rather than mid-move.
*/
export const CONTACT_VIEW = {
  position: [0, 1.2, 6.4],
  lookAt: [0, -0.1, 0],
};

/*
  How present the form should be at this point in the page.

  It is the subject during the hero and the experimental break, and a faint
  texture through the work sections in between, where a bright object would
  compete with the projects themselves. Both the material's reflections and
  the direct lights read this, because dimming only one leaves the other
  still modelling the rings.
*/
export function computePresence(sequence) {
  const hero = 1 - Math.min(Math.max(sequence.hero ?? 0, 0), 1);
  // `experimentalActive`, not the orbit progress: the orbit angle is held
  // after that section leaves so the camera stays put, but the form should
  // stop being featured the moment the section is off screen.
  const orbit = Math.min(Math.max(sequence.experimentalActive ?? 0, 0), 1);
  const finale = Math.min(Math.max(sequence.contact ?? 0, 0), 1);
  return Math.max(hero, orbit, finale, 0.08);
}

/** Finds the pair of keys `t` falls between and returns eased local progress. */
function segment(keys, t) {
  const clamped = Math.min(Math.max(t, 0), 1);

  let index = 0;
  while (index < keys.length - 2 && clamped > keys[index + 1].at) index += 1;

  const from = keys[index];
  const to = keys[index + 1];
  const span = to.at - from.at;
  const local = span > 0 ? (clamped - from.at) / span : 0;

  // Ease within each segment so the path accelerates and settles between
  // keys instead of running the whole route at constant speed.
  return { from, to, k: easeSignature(Math.min(Math.max(local, 0), 1)) };
}

const lerp = (a, b, k) => a + (b - a) * k;

/**
 * Samples the camera path at `t`, writing into the supplied vectors to avoid
 * allocating three objects every frame.
 */
export function sampleCamera(t, outPosition, outLookAt) {
  const { from, to, k } = segment(CAMERA_PATH, t);

  outPosition.set(
    lerp(from.position[0], to.position[0], k),
    lerp(from.position[1], to.position[1], k),
    lerp(from.position[2], to.position[2], k),
  );
  outLookAt.set(
    lerp(from.lookAt[0], to.lookAt[0], k),
    lerp(from.lookAt[1], to.lookAt[1], k),
    lerp(from.lookAt[2], to.lookAt[2], k),
  );
}

/** Samples the form's transform at `t` into a reusable object. */
export function sampleForm(t, out) {
  const { from, to, k } = segment(FORM_PATH, t);

  out.twist = lerp(from.twist, to.twist, k);
  out.spin = lerp(from.spin, to.spin, k);
  out.scale = lerp(from.scale, to.scale, k);
  out.envIntensity = lerp(from.envIntensity, to.envIntensity, k);
  return out;
}
