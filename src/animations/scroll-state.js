/**
 * Scroll state, shared with the 3D layer outside React.
 *
 * Scrolling drives the camera, the objects and the lighting — at 120Hz.
 * Routing that through React state would reconcile the whole tree on every
 * frame, so the scroll layer writes here and the render loop reads it. No
 * component re-renders because the page moved.
 */

export const scroll = {
  /** 0 → 1 across the whole document. */
  progress: 0,
  /** Pixels from the top. */
  y: 0,
  /** Normalised, signed, roughly -1 → 1 at speed. Smoothed by the scroll layer. */
  velocity: 0,
  /** Per-section progress, keyed by section id. */
  scenes: Object.create(null),
};

/** Called by each section's ScrollTrigger; read by the render loop. */
export function setSceneProgress(id, progress) {
  scroll.scenes[id] = progress;
}

export function getSceneProgress(id) {
  return scroll.scenes[id] ?? 0;
}
