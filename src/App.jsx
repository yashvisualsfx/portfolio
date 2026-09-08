import { useEffect } from "react";
import { useLenis } from "./animations/useLenis.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";

// Phase 1/2 foundation preview.
// This stands in for the real composition (loader, nav, hero, persistent
// R3F canvas, sections) built out in later phases — its job right now is to
// prove the design tokens, typography scale, layout primitives, Lenis smooth
// scroll and reduced-motion handling all work together before anything 3D
// or scroll-driven is layered on top.
export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  useLenis({ enabled: !reducedMotion });

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  return (
    <div id="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Reserved mount point for the persistent R3F canvas (Phase 4+) */}
      <div className="canvas-layer" aria-hidden="true" />

      <div className="content-layer">
        <header className="row container" style={{ justifyContent: "space-between", paddingBlock: "var(--space-4)" }}>
          <span className="text-h3">HARSH</span>
          <nav aria-label="Primary">
            <ul className="row" style={{ gap: "var(--space-5)" }}>
              <li className="text-small">Work</li>
              <li className="text-small">About</li>
              <li className="text-small">Contact</li>
            </ul>
          </nav>
        </header>

        <main id="main">
          <section className="section section--full container">
            <p className="text-micro eyebrow">Creative Designer</p>
            <h1 className="text-display">HARSH</h1>
            <p className="text-body-lg" style={{ maxWidth: "38ch", marginTop: "var(--space-5)" }}>
              Building visual experiences through design, motion &amp; technology.
            </p>
          </section>

          <section className="section container">
            <h2 className="text-h1">
              Selected
              <br />
              Work
            </h2>
            <p className="text-body" style={{ maxWidth: "50ch", marginTop: "var(--space-4)" }}>
              Foundation preview — the scroll-driven project scenes ship in a
              later phase. This section exists to check the type scale and
              spacing rhythm at every breakpoint.
            </p>
          </section>

          <section className="section container">
            <h2 className="text-h1">About</h2>
            <p className="text-body" style={{ maxWidth: "50ch", marginTop: "var(--space-4)" }}>
              Multidisciplinary creative focused on crafting memorable visual
              experiences across design, motion and digital interaction.
            </p>
          </section>
        </main>

        <footer className="container" style={{ paddingBlock: "var(--space-6)" }}>
          <p className="text-small">HARSH © 2026 — Designed &amp; developed with intention.</p>
        </footer>
      </div>
    </div>
  );
}
