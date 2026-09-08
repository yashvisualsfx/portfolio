import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsapEasing } from "./easing.js";

gsap.registerPlugin(ScrollTrigger);
registerGsapEasing(gsap);

/*
  Sets up the single Lenis instance the whole app scrolls through, and marries
  it to GSAP.

  The marriage matters: Lenis interpolates scroll position on its own clock,
  so a ScrollTrigger reading the browser's native scroll would lag a frame or
  two behind everything Lenis is showing — pinned sections drift and scrubbed
  timelines judder. Driving Lenis from gsap.ticker and pushing its scroll
  events into ScrollTrigger.update puts both on one clock.

  lagSmoothing is disabled because GSAP's default behaviour — clamping large
  frame deltas — makes a scrubbed timeline jump after a stall instead of
  tracking the scrollbar, which is exactly wrong for scroll-linked animation.
*/
export function useLenis({ enabled = true } = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      // Reduced motion: no smooth scroll, but ScrollTrigger still runs off
      // native scroll and needs a clean measurement pass.
      ScrollTrigger.refresh();
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
