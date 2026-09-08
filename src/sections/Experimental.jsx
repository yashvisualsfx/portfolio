import { useLayoutEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { RevealText } from "../components/ui/RevealText.jsx";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import styles from "./Experimental.module.css";

/*
  The experimental break — a pause between the work and the personal sections,
  where the 3D world takes the screen back.

  This component owns no 3D of its own. It publishes its scroll progress into
  the shared sequence ref, and the persistent canvas orbits its camera around
  the sculpture in response. That is the whole point of keeping one canvas for
  the site: a new scene is a new camera move, not a new WebGL context.
*/
export function Experimental({ sequenceRef }) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !sequenceRef) return undefined;

    if (reduced) {
      // Hold the form at a composed angle rather than orbiting it.
      sequenceRef.current.experimental = 0.5;
      sequenceRef.current.experimentalActive = 0;
      return undefined;
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          sequenceRef.current.experimental = self.progress;
        },
        // Camera and presence are tracked separately on purpose. The orbit
        // angle is held at its end value after the section leaves, so the
        // camera doesn't lurch back to the hero framing behind the next
        // section — but the form stops being *featured*, so it dims out of
        // the way of the content that follows.
        onToggle: (self) => {
          sequenceRef.current.experimentalActive = self.isActive ? 1 : 0;
        },
        onLeave: () => {
          sequenceRef.current.experimental = 1;
          sequenceRef.current.experimentalActive = 0;
        },
        onLeaveBack: () => {
          sequenceRef.current.experimental = 0;
          sequenceRef.current.experimentalActive = 0;
        },
      });
    }, section);

    return () => {
      context.revert();
      sequenceRef.current.experimental = 0;
      sequenceRef.current.experimentalActive = 0;
    };
  }, [reduced, sequenceRef]);

  return (
    <section
      className={styles.root}
      id="experimental"
      ref={sectionRef}
      aria-labelledby="experimental-heading"
    >
      <div className={styles.viewport}>
        <div className={`container ${styles.overlay}`}>
          <RevealText
            as="h2"
            id="experimental-heading"
            className={styles.statement}
            lines={["Ideas", "In Motion."]}
          />
          <p className={`text-micro ${styles.caption}`}>Scroll to orbit</p>
        </div>
      </div>
    </section>
  );
}
