/**
 * Pointer position, shared with the 3D layer outside React.
 *
 * One listener for the whole site, written to a mutable object that the
 * render loop reads. Pointer movement must never cause a React render —
 * at 120Hz that would be 120 reconciliations a second for a parallax tilt.
 *
 * `x`/`y` are the raw target in -1 → 1 normalised device space;
 * `sx`/`sy` are the smoothed values the scene actually uses.
 */
export const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false };

let bound = false;

export function bindPointer() {
  if (bound || typeof window === 'undefined') return () => {};
  bound = true;

  const onMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    pointer.active = true;
  };

  const onLeave = () => {
    pointer.x = 0;
    pointer.y = 0;
    pointer.active = false;
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave, { passive: true });
  window.addEventListener('blur', onLeave);

  return () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('blur', onLeave);
    bound = false;
  };
}
