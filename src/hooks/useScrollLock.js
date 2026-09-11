import { useEffect } from 'react';

/**
 * Freeze page scrolling — used by the preloader and the fullscreen menu.
 * Reference-counted so two overlapping owners cannot unlock each other.
 */
let locks = 0;

export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    locks += 1;
    document.body.dataset.scrollLocked = 'true';
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) delete document.body.dataset.scrollLocked;
    };
  }, [locked]);
}
