/**
 * THE JOURNEY
 *
 * The whole site is one corridor in Z. The camera only ever travels forward
 * through it, and every scene is built at its own depth along the way:
 *
 *      +9 ────── 0 ─────── -14 … -54 ────── -70 ── -86 ── -98 ── -112
 *     start   monolith     the six projects  gallery orbit  about  finale
 *
 * Because the path is continuous by construction, no transition between
 * sections needs to be choreographed as a cut — the camera simply arrives.
 *
 * Section ranges are measured from the real DOM (see hooks/useScrollScene)
 * so the camera can never drift out of sync with the type it is moving past.
 */

import { clamp } from '../animations/easings';

export const SCENE_Z = {
  monolith: 0,
  work: -14, // first project; each subsequent project steps by WORK_STEP
  gallery: -70,
  capabilities: -84,
  orbit: -96,
  about: -110,
  statement: -120,
  finale: -130,
};

export const WORK_STEP = -8;

const pose = (position, target, fov = 38) => ({ position, target, fov });

/**
 * Poses that a section explicitly claims as its starting point. Sections
 * that are simply travelled through (capabilities, about) claim none: they
 * inherit wherever the previous section left the camera.
 */
const ENTRY = {
  hero: pose([0, 0, 9], [0, 0, 0], 38),

  // The signature move begins: pushed in close to the stack.
  transform: pose([0, 0.2, 5.6], [0, 0, 0], 38),

  // Through it, and out the far side into the corridor.
  work: pose([0.9, -0.15, -6.5], [0.2, 0, SCENE_Z.work], 44),

  // Held in front of the panel wall.
  gallery: pose([0, 0, SCENE_Z.gallery + 8.5], [0, 0, SCENE_Z.gallery], 40),

  // The pause: swung out to one side of the form.
  orbit: pose([5.4, 0.6, SCENE_Z.orbit + 5.2], [0, 0, SCENE_Z.orbit], 40),

  statement: pose([0, 0, SCENE_Z.statement + 7], [0, 0, SCENE_Z.statement], 42),

  finale: pose([0, 0.3, SCENE_Z.finale + 8], [0, 0, SCENE_Z.finale], 38),
};

/**
 * Sections that do not simply hand the camera to the next one.
 *   gallery  holds position — the panels do the travelling, not the camera
 *   orbit    sweeps around the form rather than passing it
 *   finale   settles into the closing composition
 */
const EXIT = {
  gallery: pose([0, 0, SCENE_Z.gallery + 6.6], [0, 0, SCENE_Z.gallery - 1], 40),
  orbit: pose([-5.4, -0.6, SCENE_Z.orbit + 5.2], [0, 0, SCENE_Z.orbit], 40),
  finale: pose([0, 0, SCENE_Z.finale + 6], [0, 0, SCENE_Z.finale], 34),
};

/** The order the corridor is travelled in. */
export const JOURNEY = [
  'hero',
  'transform',
  'work',
  'gallery',
  'capabilities',
  'orbit',
  'about',
  'statement',
  'finale',
];

/**
 * The chain: a section starts exactly where the previous one ended, and ends
 * at its own declared exit or at the next section's declared entry. Both
 * ends are therefore shared values, so no seam can open up between sections
 * — continuity is a property of the structure, not of remembering to keep
 * two numbers in sync.
 */
export const SECTION_POSES = (() => {
  const poses = {};
  let previous = null;

  JOURNEY.forEach((id, index) => {
    const from = previous ?? ENTRY[id];
    let to = EXIT[id];

    if (!to) {
      for (let i = index + 1; i < JOURNEY.length && !to; i += 1) {
        to = ENTRY[JOURNEY[i]];
      }
    }

    poses[id] = { from, to: to ?? from };
    previous = poses[id].to;
  });

  return poses;
})();

export const CAMERA_POSES = { intro: SECTION_POSES.hero.from };

/** Measured ranges in global scroll progress, ordered. Written by the scroll layer. */
let ranges = [];

export function setSectionRanges(next) {
  ranges = next
    .filter((range) => SECTION_POSES[range.id] && range.end > range.start)
    .sort((a, b) => a.start - b.start);
}

export function getSectionRanges() {
  return ranges;
}

/** Ease the interpolation so a section's edges are never a velocity step. */
const smooth = (t) => t * t * (3 - 2 * t);

const lerpTriple = (a, b, t, out) => {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
};

/**
 * Resolve the camera pose for the current scroll position, writing into
 * `out` so the render loop allocates nothing per frame.
 */
export function resolvePose(scrollState, out) {
  if (ranges.length === 0) {
    const hero = SECTION_POSES.hero.from;
    out.position[0] = hero.position[0];
    out.position[1] = hero.position[1];
    out.position[2] = hero.position[2];
    out.target[0] = hero.target[0];
    out.target[1] = hero.target[1];
    out.target[2] = hero.target[2];
    out.fov = hero.fov;
    return out;
  }

  const p = clamp(scrollState.progress);

  let active = ranges[0];
  for (let i = 0; i < ranges.length; i += 1) {
    if (p >= ranges[i].start) active = ranges[i];
    else break;
  }

  const section = SECTION_POSES[active.id];
  const span = active.end - active.start;
  const t = smooth(clamp(span > 0 ? (p - active.start) / span : 0));

  lerpTriple(section.from.position, section.to.position, t, out.position);
  lerpTriple(section.from.target, section.to.target, t, out.target);
  out.fov = section.from.fov + (section.to.fov - section.from.fov) * t;
  return out;
}
