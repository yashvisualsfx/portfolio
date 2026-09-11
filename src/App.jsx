import { Suspense, lazy, useCallback, useRef, useState } from 'react';
import { AppProvider } from './context/AppProvider';
import { SkipLink } from './components/layout';
import { Navigation, Menu, ProjectDetail, Cursor } from './components/ui';
import { Preloader } from './sections/Preloader';
import { Hero } from './sections/Hero';
import { Transform } from './sections/Transform';
import { Work } from './sections/Work';
import { Gallery } from './sections/Gallery';
import { Capabilities } from './sections/Capabilities';
import { Break } from './sections/Break';
import { About } from './sections/About';
import { Statement } from './sections/Statement';
import { Contact, Footer } from './sections/Contact';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useScrollScenes } from './hooks/useScrollScenes';
import { useApp } from './hooks/useApp';
import { hasWebGL } from './three/webgl-support';

// The WebGL runtime is the largest dependency in the site. Splitting it out
// keeps it off the critical path: the preloader, the type and the layout all
// paint while three.js is still arriving.
const Stage = lazy(() => import('./three/Stage'));

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
  const { toggleMenu, reducedMotion } = useApp();
  const [openProject, setOpenProject] = useState(null);
  const [ctaPressure, setCtaPressure] = useState(0);

  const showProject = useCallback((id) => setOpenProject(id), []);
  const closeProject = useCallback(() => setOpenProject(null), []);

  // Lenis owns the scroll position and GSAP's ticker owns the clock; the
  // scenes are bound to the real measured sections. Both live at the root so
  // there is exactly one of each for the whole session.
  useSmoothScroll({ reduced: reducedMotion });
  useScrollScenes([reducedMotion]);

  return (
    <>
      <SkipLink />
      <Cursor />
      <Preloader />

      {hasWebGL() && (
        <Suspense fallback={null}>
          <Stage ctaPressure={ctaPressure} paused={Boolean(openProject)} />
        </Suspense>
      )}

      <div className="grade" aria-hidden="true" />

      <Navigation onOpenMenu={toggleMenu} triggerRef={menuTriggerRef} />
      <Menu triggerRef={menuTriggerRef} />

      <main id="main" className="content">
        <Hero />
        <Transform />
        <Work onOpenProject={showProject} />
        <Gallery />
        <Capabilities />
        <Break />
        <About />
        <Statement />
        <Contact onCtaPressure={setCtaPressure} />
      </main>

      <Footer />

      <ProjectDetail
        projectId={openProject}
        onClose={closeProject}
        onNavigate={showProject}
      />
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
