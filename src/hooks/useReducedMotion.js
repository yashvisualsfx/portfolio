import { useEffect } from 'react';
import { useMediaQuery } from './useMediaQuery';

/**
 * Single source of truth for reduced motion.
 *
 * Returns the boolean for JS-driven systems (GSAP timelines, R3F loops,
 * Motion variants) and mirrors it onto <html data-motion> so CSS that cannot
 * see React state stays in sync too.
 */
export function useReducedMotion() {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);

  return reduced;
}
