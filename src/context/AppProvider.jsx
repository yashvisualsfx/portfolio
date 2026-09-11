import { useCallback, useMemo, useState } from 'react';
import { AppContext, PHASE } from './app-context';
import { useDeviceProfile } from '../hooks/useDeviceProfile';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollLock } from '../hooks/useScrollLock';

export function AppProvider({ children }) {
  const device = useDeviceProfile();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(PHASE.loading);
  const [menuOpen, setMenuOpen] = useState(false);

  // The page must not scroll behind the preloader or the fullscreen menu.
  useScrollLock(phase === PHASE.loading || menuOpen);

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const value = useMemo(
    () => ({
      device,
      reducedMotion,
      phase,
      setPhase,
      isReady: phase === PHASE.ready,
      menuOpen,
      setMenuOpen,
      toggleMenu,
      closeMenu,
    }),
    [device, reducedMotion, phase, menuOpen, toggleMenu, closeMenu],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
