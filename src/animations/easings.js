/**
 * Motion vocabulary. Every animation in the site — CSS, Motion or GSAP —
 * pulls its curve and its duration from here so the whole experience shares
 * one sense of weight.
 *
 * `signature` is the site's identity curve: a heavy in-out that gives motion
 * mass on the way out and precision on the way in.
 */

export const EASE = {
  signature: [0.76, 0, 0.24, 1],
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inQuart: [0.5, 0, 0.75, 0],
};

export const CSS_EASE = {
  signature: 'cubic-bezier(0.76, 0, 0.24, 1)',
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  outQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  inQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
};

/** Seconds. Mirrors the --dur-* tokens. */
export const DUR = {
  xfast: 0.18,
  fast: 0.32,
  mid: 0.68,
  slow: 1.1,
  cine: 1.6,
};

/** Stagger steps, in seconds. Small enough to read as one gesture. */
export const STAGGER = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
};

/** GSAP ease strings registered by `registerCustomEases()` in gsap-setup.js. */
export const GSAP_EASE = {
  signature: 'site.signature',
  outExpo: 'site.outExpo',
  outQuart: 'site.outQuart',
};

/**
 * Linear interpolation — the one primitive behind every smoothed camera,
 * cursor and parallax value in the site.
 */
export const lerp = (from, to, t) => from + (to - from) * t;

/**
 * Frame-rate independent damping. `smoothing` is the fraction of the gap
 * left after one second, so behaviour is identical at 60 and 120Hz.
 */
export const damp = (from, to, smoothing, dt) =>
  lerp(from, to, 1 - Math.pow(smoothing, dt));

export const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

/** Map a value from one range to another, clamped. */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
};
