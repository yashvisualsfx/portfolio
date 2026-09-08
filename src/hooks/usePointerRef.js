import { useEffect, useRef } from "react";

/**
 * Normalized pointer position (-1..1 on both axes) kept in a ref.
 *
 * A ref rather than state on purpose: the 3D scene samples this every frame,
 * and re-rendering React on every mouse move would cost far more than the
 * effect it drives.
 */
export function usePointerRef({ enabled = true } = {}) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return undefined;
    }

    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    // Recentre when the cursor leaves, so the form settles rather than
    // holding whatever tilt it had at the edge of the window.
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  return pointer;
}
