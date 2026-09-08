import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Preloader } from "./components/layout/Preloader.jsx";
import { Navigation } from "./components/layout/Navigation.jsx";
import { Hero } from "./sections/Hero.jsx";
import { useLenis } from "./animations/useLenis.js";
import { useAnchorScroll } from "./animations/useAnchorScroll.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";
import { useIsTouchDevice } from "./hooks/useIsTouchDevice.js";
import { getMedia } from "./data/media.js";
import styles from "./App.module.css";
import { activeCategories, allWork } from "./data/projects.js";

// three + drei are the heaviest thing the site loads and nothing above the
// fold needs them, so the whole 3D layer is a separate chunk: the preloader
// and hero paint while it streams in behind them.
const Scene = lazy(() => import("./three/Scene.jsx"));

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
// excluded — it streams on demand once its scene is close. Empty while the
// project media slots are unfilled, which leaves the loader waiting on fonts
// alone; it fills itself as soon as real assets are wired up.
const PRELOAD_SOURCES = allWork
  .map((item) => getMedia(item.media))
  .filter(Boolean)
  .slice(0, 3)
  .map((media) => (media.type === "video" ? media.poster : media.src));

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const [phase, setPhase] = useState(PHASE.loading);

  const lenisRef = useLenis({ enabled: !reducedMotion });
  useAnchorScroll(lenisRef);

  // The hero's scroll sequence, written by ScrollTrigger and sampled by the
  // 3D scene every frame. A ref rather than state on purpose: this changes on
  // every scroll event, and re-rendering the tree that often would cost far
  // more than the animation it drives.
  const sequenceRef = useRef({ hero: 0 });

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
            sequenceRef={sequenceRef}
          />
        </Suspense>
      </div>

      <div className="content-layer">
        <Navigation visible={phase === PHASE.ready} />

        <main id="main">
          <Hero active={introStarted} sequenceRef={sequenceRef} />

          {/* Placeholder anchors so the navigation and hero CTA resolve.
              Phase 6 replaces each of these with its own scroll scene — the
              layout each category needs is already declared in the data. */}
          <section className="section container" id="work" aria-labelledby="work-heading">
            <h2 className="text-h1" id="work-heading">
              Selected
              <br />
              Work
            </h2>
            <ul style={{ marginTop: "var(--space-5)" }}>
              {activeCategories.map((category) => (
                <li key={category.id} id={category.id} className={styles.categoryRow}>
                  <span className="text-micro">{category.index}</span>
                  <span className="text-h3">{category.label}</span>
                  <span className="text-small">
                    {category.items.length} {category.items.length === 1 ? "piece" : "pieces"} ·{" "}
                    {category.layout}
                  </span>
                </li>
              ))}
            </ul>
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
