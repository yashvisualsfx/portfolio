import { useEffect, useRef } from "react";
import { RevealText } from "../components/ui/RevealText.jsx";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { marqueeWords } from "../data/site.js";
import styles from "./Marquee.module.css";

/*
  Infinite typographic band, with scroll velocity leaning on its speed.

  Driven by a single translate on one track rather than a CSS keyframe loop,
  because the velocity coupling needs a value that changes per frame. Two
  identical groups make the wrap seamless: when the first has travelled its
  own width, the offset resets and the second is already exactly where the
  first was.
*/
export function Marquee() {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    if (reduced) return undefined;

    let frame;
    let offset = 0;
    let lastScroll = window.scrollY;
    let velocity = 0;
    let last = performance.now();

    const onScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      // Accumulate, then decay in the loop — a raw per-event delta would
      // spike and drop rather than reading as momentum.
      velocity += delta;
    };

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      velocity *= 0.9;

      const width = groupRef.current?.offsetWidth ?? 0;
      if (width > 0) {
        // Base drift plus a nudge from how fast the page is moving.
        offset -= (60 * dt + velocity * 0.06);
        // Wrap in both directions so scrolling up never tears the band.
        offset = ((offset % width) + width) % width;
        trackRef.current.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const group = (
    <div className={styles.group}>
      {marqueeWords.map((word) => (
        <span className={styles.word} key={word}>
          {word}
          <span className={styles.mark} aria-hidden="true">
            {" ×"}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <>
      <section className={styles.root} aria-label="Disciplines">
        <div className={styles.track} ref={trackRef}>
          <div ref={groupRef} className={styles.group}>
            {group.props.children}
          </div>
          <div className={styles.group} aria-hidden="true">
            {group.props.children}
          </div>
        </div>
      </section>

      <section className={`container ${styles.statement}`} aria-labelledby="statement-heading">
        {/* The middle line sits behind the canvas so the 3D form passes
            through the statement — the outer two stay in front of it. */}
        <RevealText
          as="h2"
          id="statement-heading"
          className={styles.statementText}
          lines={["Make"]}
        />
        <RevealText
          as="p"
          className={`${styles.statementText} ${styles.behind}`}
          lines={["It"]}
          aria-hidden="true"
        />
        <RevealText as="p" className={styles.statementText} lines={["Memorable."]} aria-hidden="true" />
        <span className="visually-hidden">Make it memorable.</span>
      </section>
    </>
  );
}
