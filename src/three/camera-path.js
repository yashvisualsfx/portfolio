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
 * Each section owns the camera from its own entry pose to its exit pose.
 * A section's exit pose is the next section's entry pose — that shared
 * value is what makes the whole path read as a single move.
 */
export const SECTION_POSES = {
  // The hero: a slow push toward the monolith while the type resolves.
  hero: {
    from: pose([0, 0, 9], [0, 0, 0], 38),
    to: pose([0, 0.2, 5.6], [0, 0, 0], 38),
  },

  // The signature move: straight through the stack as it opens.
  transform: {
    from: pose([0, 0.2, 5.6], [0, 0, 0], 38),
    to: pose([0.9, -0.15, -6.5], [0.2, 0, SCENE_Z.work + 2], 52),
  },

  // The work corridor: the camera drifts down the line of project panels.
  work: {
    from: pose([0.9, -0.15, -6.5], [0.2, 0, SCENE_Z.work], 44),
    to: pose([0, 0, SCENE_Z.work + WORK_STEP * 5 + 6], [0, 0, SCENE_Z.gallery + 8], 40),
  },

  // The gallery: the camera holds still in Z and the panels pass it.
  gallery: {
    from: pose([0, 0, SCENE_Z.gallery + 9], [0, 0, SCENE_Z.gallery], 40),
    to: pose([0, 0, SCENE_Z.gallery + 5], [0, 0, SCENE_Z.gallery - 2], 40),
  },

  capabilities: {
    from: pose([0, 0, SCENE_Z.capabilities + 9], [0, 0, SCENE_Z.capabilities], 40),
    to: pose([0, 0.4, SCENE_Z.capabilities + 4], [0, 0, SCENE_Z.orbit + 4], 40),
  },

  // The pause: the camera orbits the form rather than passing it.
  orbit: {
    from: pose([5.2, 0.6, SCENE_Z.orbit + 5.5], [0, 0, SCENE_Z.orbit], 40),
    to: pose([-5.2, -0.6, SCENE_Z.orbit + 5.5], [0, 0, SCENE_Z.orbit], 40),
  },

  about: {
    from: pose([-2.2, 0, SCENE_Z.about + 9], [0, 0, SCENE_Z.about], 40),
    to: pose([1.4, 0.2, SCENE_Z.about + 5], [0, 0, SCENE_Z.statement], 40),
  },

  statement: {
    from: pose([0, 0, SCENE_Z.statement + 7], [0, 0, SCENE_Z.statement], 42),
    to: pose([0, 0, SCENE_Z.statement - 1], [0, 0, SCENE_Z.finale], 42),
  },

  // The settle: the form comes to rest in its final composition.
  finale: {
    from: pose([0, 0.3, SCENE_Z.finale + 8], [0, 0, SCENE_Z.finale], 38),
    to: pose([0, 0, SCENE_Z.finale + 6.2], [0, 0, SCENE_Z.finale], 34),
  },
};

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
