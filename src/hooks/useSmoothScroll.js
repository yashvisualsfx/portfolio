import { useEffect } from 'react';
import Lenis from 'lenis';
import { setupGsap, gsap, ScrollTrigger } from '../animations/gsap-setup';
import { scroll } from '../animations/scroll-state';
import { clamp } from '../animations/easings';

/**
 * The scroll layer.
 *
 * Lenis owns the scroll position, GSAP's ticker owns the clock, and
 * ScrollTrigger is updated from Lenis rather than from native scroll events
 * — three systems, one heartbeat. Anything else produces the classic
 * half-frame lag between smoothed DOM and un-smoothed 3D.
 *
 * Everything the render loop needs is written into the mutable scroll state;
 * React is never told that the page moved.
 */
export function useSmoothScroll({ enabled = true, reduced = false } = {}) {
  useEffect(() => {
    setupGsap();

    // With reduced motion the page uses the browser's own scrolling: smooth
    // interpolation is itself motion, and inertia is what people turn off.
    if (!enabled || reduced) {
      const onScroll = () => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        scroll.y = window.scrollY;
        scroll.progress = limit > 0 ? clamp(window.scrollY / limit) : 0;
        scroll.velocity = 0;
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    const lenis = new Lenis({
      duration: 1.15,
      // Matches the site's signature curve closely enough to feel like one
      // system rather than two.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    const onLenisScroll = ({ scroll: y, limit, velocity }) => {
      scroll.y = y;
      scroll.progress = limit > 0 ? clamp(y / limit) : 0;
      // Normalised so downstream effects can use it without knowing pixels.
      scroll.velocity = clamp(velocity / 40, -1, 1);
      ScrollTrigger.update();
    };

    lenis.on('scroll', onLenisScroll);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    // GSAP's lag smoothing fights Lenis after a stall; let real time through.
    gsap.ticker.lagSmoothing(0);

    // Anchor links must go through Lenis or they bypass the smoothing.
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(raf);
      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
    };
  }, [enabled, reduced]);
}
