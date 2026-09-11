import { createContext } from 'react';

/**
 * Experience-wide state. Kept deliberately small: device capability, motion
 * preference, the boot phase and the menu. Anything scroll-derived belongs to
 * the scroll layer, not here, so a scroll frame never re-renders the tree.
 */
export const AppContext = createContext(null);

/** Boot phases, in order. Drives the preloader → hero handoff. */
export const PHASE = {
  loading: 'loading',
  revealing: 'revealing',
  ready: 'ready',
};
