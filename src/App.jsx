import { useRef } from 'react';
import { AppProvider } from './context/AppProvider';
import { SkipLink } from './components/layout';
import { Navigation, Menu } from './components/ui';
import { Preloader } from './sections/Preloader';
import { Hero } from './sections/Hero';
import { useApp } from './hooks/useApp';

/**
 * Composition root. App.jsx only ever assembles — providers, layers and the
 * section order. No section logic, no animation, no markup of its own.
 *
 * Layer order (root stacking context):
 *   .layer-behind  z-index -1  type the 3D form passes in front of
 *   .stage         z-index  0  one persistent WebGL canvas       [phase 4]
 *   .layer-front   z-index  1  type and interface in front of it
 *   overlays       nav, menu, cursor, preloader
 */
function Experience() {
  const menuTriggerRef = useRef(null);
  const { toggleMenu } = useApp();

  return (
    <>
      <SkipLink />
      <Preloader />
      <Navigation onOpenMenu={toggleMenu} triggerRef={menuTriggerRef} />
      <Menu triggerRef={menuTriggerRef} />

      <main id="main" className="content">
        <Hero />
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Experience />
    </AppProvider>
  );
}
