import { useEffect, useRef, useState } from 'react';
import { watchForPass } from '../animations/reveal-sweeper';

/**
 * Has this element been revealed yet?
 *
 * Two signals, because one is not enough: an IntersectionObserver for the
 * normal case (the element scrolls into view) and the shared sweeper for the
 * case IO cannot report (the viewport jumped straight past it).
 *
 * Once true it never goes back — a reveal is a one-way door.
 */
export function useRevealed({ amount = 0.15, enabled = true } = {}) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(!enabled);

  useEffect(() => {
    if (!enabled || revealed) return undefined;
    const element = ref.current;
    if (!element) return undefined;

    const show = () => setRevealed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) show();
      },
      { threshold: Math.min(amount, 0.99) },
    );
    observer.observe(element);

    const unwatch = watchForPass(element, show);

    return () => {
      observer.disconnect();
      unwatch();
    };
  }, [amount, enabled, revealed]);

  return [ref, revealed];
}
