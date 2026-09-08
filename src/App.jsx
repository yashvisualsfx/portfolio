import { useCallback, useEffect, useState } from "react";
import { Preloader } from "./components/layout/Preloader.jsx";
import { Navigation } from "./components/layout/Navigation.jsx";
import { Hero } from "./sections/Hero.jsx";
import { useLenis } from "./animations/useLenis.js";
import { useAnchorScroll } from "./animations/useAnchorScroll.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";
import { getMedia } from "./data/media.js";
import { projects } from "./data/projects.js";

/*
  Intro state machine.

  loading   — preloader holds the screen, page scroll is locked
  revealing — panels are parting, the hero is animating in behind them
  ready     — curtain is clear; navigation arrives and scrolling is handed back

  Later phases read this same value to drive the opening camera push, which is
  what keeps the loader, the hero and the 3D scene reading as one move.
*/
const PHASE = { loading: "loading", revealing: "revealing", ready: "ready" };

// Stills the first screens need before the curtain parts. Video is deliberately
// excluded — it streams on demand once its scene is close.
const PRELOAD_SOURCES = projects
  .map((project) => getMedia(project.media))
  .filter(Boolean)
  .slice(0, 3)
  .map((media) => (media.type === "video" ? media.poster : media.src));

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(PHASE.loading);

  const lenisRef = useLenis({ enabled: !reducedMotion });
  useAnchorScroll(lenisRef);

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

      {/* Reserved mount point for the persistent R3F canvas (Phase 4) */}
      <div className="canvas-layer" aria-hidden="true" />

      <div className="content-layer">
        <Navigation visible={phase === PHASE.ready} />

        <main id="main">
          <Hero active={introStarted} />

          {/* Placeholder anchors so the navigation and hero CTA resolve.
              Phases 6–8 replace these with the real scenes. */}
          <section className="section container" id="work" aria-labelledby="work-heading">
            <h2 className="text-h1" id="work-heading">
              Selected
              <br />
              Work
            </h2>
            <p className="text-body" style={{ maxWidth: "50ch", marginTop: "var(--space-4)" }}>
              {projects.length} projects, arranged as fullscreen scroll scenes in Phase 6.
            </p>
          </section>

          <section className="section container" id="about" aria-labelledby="about-heading">
            <h2 className="text-h1" id="about-heading">
              About
            </h2>
            <p className="text-body" style={{ maxWidth: "50ch", marginTop: "var(--space-4)" }}>
              Editorial layout and portrait parallax arrive in Phase 7.
            </p>
          </section>

          <section className="section container" id="contact" aria-labelledby="contact-heading">
            <h2 className="text-h1" id="contact-heading">
              Contact
            </h2>
            <p className="text-body" style={{ maxWidth: "50ch", marginTop: "var(--space-4)" }}>
              Final composition arrives in Phase 8.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
