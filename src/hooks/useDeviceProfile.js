import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

/**
 * The one place the site decides "how much experience can this device take?".
 *
 * Layout uses `breakpoint`; the WebGL stage uses `dpr` and `tier` to scale
 * geometry detail, effect count and render resolution; the cursor and hover
 * interactions use `hasPointer`. Nothing else should call matchMedia directly.
 */

export const BREAKPOINTS = {
  sm: 390, // phone — the design's lower bound
  md: 768, // tablet
  lg: 1200, // laptop
  xl: 1440, // desktop — the design's reference width
};

export function useDeviceProfile() {
  const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  // A real mouse or trackpad — not "screen is wide", which lies on tablets.
  const hasPointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  return useMemo(() => {
    const breakpoint = isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : 'sm';
    const isMobile = !isMd;

    // Hardware concurrency is a crude signal, but it is the only one
    // available before a frame is rendered. The stage refines it later
    // from measured frame time.
    const cores =
      typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
    const tier = isMobile || cores <= 4 ? 'low' : cores <= 8 ? 'mid' : 'high';

    // Rendering above 2x buys nothing visible and costs 4x the fill rate.
    const maxDpr = isMobile ? 1.5 : 2;
    const dpr =
      typeof window !== 'undefined'
        ? [1, Math.min(window.devicePixelRatio || 1, maxDpr)]
        : [1, 1];

    return { breakpoint, isMobile, isDesktop: isLg, hasPointer, tier, dpr };
  }, [isMd, isLg, isXl, hasPointer]);
}
