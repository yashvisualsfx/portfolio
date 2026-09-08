import { useEffect, useRef } from "react";

/**
 * Scroll position kept in a ref, in two forms the 3D scene actually needs:
 *
 *   `viewports` — distance scrolled measured in viewport heights, which is
 *                 the unit scene choreography is authored in
 *   `progress`  — 0..1 across the whole document
 *
 * Ref-based for the same reason as the pointer: this is read every frame by
 * the render loop, and driving it through React state would re-render the
 * tree on every scroll event.
 */
export function useScrollRef() {
  const scroll = useRef({ viewports: 0, progress: 0 });

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current.viewports = window.scrollY / Math.max(window.innerHeight, 1);
      scroll.current.progress = max > 0 ? window.scrollY / max : 0;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return scroll;
}
