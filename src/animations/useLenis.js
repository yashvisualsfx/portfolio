import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Sets up the single Lenis instance the whole app scrolls through and
// drives it from requestAnimationFrame. Later phases read `lenisRef.current`
// to sync GSAP ScrollTrigger and R3F scroll-progress uniforms to the same
// smoothed scroll value instead of the raw scroll event.
export function useLenis({ enabled = true } = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let frameId;
    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
