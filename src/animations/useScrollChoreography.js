import { useEffect } from 'react';
import { setupGsap, gsap } from './gsap-setup';

/**
 * A scrubbed GSAP timeline bound to an element, torn down completely on
 * unmount — context, tweens and ScrollTrigger instances alike.
 *
 * Every scroll sequence in the site goes through this so no section can
 * leave a listener or a trigger behind when it unmounts, which is the usual
 * source of ghost scroll behaviour in long single-page experiences.
 */
export function useScrollChoreography(ref, build, { enabled = true, deps = [] } = {}) {
  useEffect(() => {
    if (!enabled || !ref.current) return undefined;
    setupGsap();

    const context = gsap.context((self) => build(self, ref.current), ref);
    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
