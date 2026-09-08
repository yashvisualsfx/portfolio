import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Preloader } from "./components/layout/Preloader.jsx";
import { Navigation } from "./components/layout/Navigation.jsx";
import { Cursor } from "./components/layout/Cursor.jsx";
import { Hero } from "./sections/Hero.jsx";
import { Work } from "./sections/Work.jsx";
import { Experimental } from "./sections/Experimental.jsx";
import { Skills } from "./sections/Skills.jsx";
import { About } from "./sections/About.jsx";
import { Marquee } from "./sections/Marquee.jsx";
import { Contact } from "./sections/Contact.jsx";
import { useLenis } from "./animations/useLenis.js";
import { useAnchorScroll } from "./animations/useAnchorScroll.js";
import { useRefreshOnResize } from "./animations/useRefreshOnResize.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";
import { useIsTouchDevice } from "./hooks/useIsTouchDevice.js";
import { useTheme } from "./hooks/useTheme.js";
import { getMedia } from "./data/media.js";
import { allWork } from "./data/projects.js";

// three + drei are the heaviest thing the site loads and nothing above the
// fold needs them, so the whole 3D layer is a separate chunk: the preloader
// and hero paint while it streams in behind them.
const Scene = lazy(() => import("./three/Scene.jsx"));

/*
  Intro state machine.

  loading   — preloader holds the screen, page scroll is locked
  revealing — panels are parting, the hero is animating in behind them
  ready     — curtain is clear; navigation arrives and scrolling is handed back
*/
const PHASE = { loading: "loading", revealing: "revealing", ready: "ready" };

// Stills the first screens need before the curtain parts. Video is
// deliberately excluded — clips stream on demand once their scene is close.
const PRELOAD_SOURCES = allWork
  .map((item) => getMedia(item.media))
  .filter(Boolean)
  .slice(0, 3)
  .map((media) => (media.type === "video" ? media.poster : media.src));

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const { theme, toggle: toggleTheme } = useTheme();
  const [phase, setPhase] = useState(PHASE.loading);

  const lenisRef = useLenis({ enabled: !reducedMotion });
  useAnchorScroll(lenisRef);
  useRefreshOnResize();

  /*
    Scroll progress for every scene that drives the 3D camera, written by
    ScrollTriggers and sampled by the render loop each frame. A ref rather
    than state: these change on every scroll event, and re-rendering the tree
    that often would cost far more than the animation it drives.
  */
  const sequenceRef = useRef({ hero: 0, experimental: 0, experimentalActive: 0, contact: 0 });

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  // Hold the page still while the loader owns the screen. Lenis and the
  // native scrollbar both need pinning — Lenis alone still lets a keyboard or
  // trackpad scroll move the underlying document.
  useEffect(() => {
    const locked = phase === PHASE.loading;
    document.body.style.overflow = locked ? "hidden" : "";
    if (locked) lenisRef.current?.stop();
    else lenisRef.current?.start();

    return () => {
      document.body.style.overflow = "";
    };
  }, [phase, lenisRef]);

  const handleReveal = useCallback(() => setPhase(PHASE.revealing), []);
  const handleComplete = useCallback(() => setPhase(PHASE.ready), []);

  const introStarted = phase !== PHASE.loading;

  return (
    <div id="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Preloader
        sources={PRELOAD_SOURCES}
        onReveal={handleReveal}
        onComplete={handleComplete}
      />

      {/* One WebGL canvas for the whole site, behind every section. */}
      <div className="canvas-layer" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene
            intro={introStarted}
            reduced={reducedMotion}
            isTouch={isTouch}
            theme={theme}
            sequenceRef={sequenceRef}
          />
        </Suspense>
      </div>

      <div className="content-layer">
        <Navigation
          visible={phase === PHASE.ready}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main id="main">
          <Hero active={introStarted} sequenceRef={sequenceRef} />
          <Work />
          <Experimental sequenceRef={sequenceRef} />
          <Skills />
          <About />
          <Marquee />
          <Contact sequenceRef={sequenceRef} />
        </main>
      </div>

      <Cursor />
    </div>
  );
}
