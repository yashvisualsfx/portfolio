import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { MediaFrame } from "../components/ui/MediaFrame.jsx";
import { RevealText } from "../components/ui/RevealText.jsx";
import { fadeUp, stagger, inView } from "../animations/variants.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { useIsTouchDevice } from "../hooks/useIsTouchDevice.js";
import { skills } from "../data/skills.js";
import styles from "./Skills.module.css";

/*
  Capabilities as an oversized typographic list rather than a grid of cards.

  Hovering a row shifts it, brings its description in, and raises a preview of
  the work behind the claim. There is exactly one preview element, moved and
  re-pointed on hover — seven mounted videos would mean seven decoders running
  to show at most one.
*/
export function Skills() {
  const reduced = usePrefersReducedMotion();
  const isTouch = useIsTouchDevice();
  const previewRef = useRef(null);
  const frameRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(null);

  const enabled = !isTouch && !reduced;
  const active = activeIndex === null ? null : skills[activeIndex];

  // The preview trails the cursor on its own rAF rather than in a pointer
  // handler, so it interpolates smoothly instead of snapping per event.
  useEffect(() => {
    if (!enabled) return undefined;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      const node = previewRef.current;
      if (node) {
        node.style.transform = `translate3d(${current.x + 28}px, ${current.y - 40}px, 0)`;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  const clear = useCallback(() => setActiveIndex(null), []);

  return (
    <section className={`container ${styles.root}`} id="skills" aria-labelledby="skills-heading">
      <header className={styles.head}>
        <span className="text-micro">What I do</span>
        <RevealText
          as="h2"
          id="skills-heading"
          className={styles.heading}
          lines={["What", "I Do"]}
        />
      </header>

      <motion.ul
        className={styles.list}
        variants={stagger(0.07)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        onMouseLeave={clear}
      >
        {skills.map((skill, index) => (
          <motion.li
            className={styles.row}
            key={skill.index}
            variants={fadeUp(reduced, { distance: 20 })}
            onMouseEnter={() => enabled && setActiveIndex(index)}
            // Deliberately not focusable: these rows carry no action, and a
            // tab stop that does nothing is a worse experience than none.
            // The summaries stay in the accessibility tree regardless — only
            // their opacity is animated.
          >
            <span className={`text-micro ${styles.index}`}>{skill.index}</span>
            <span className={styles.title}>{skill.title}</span>
            <span className={`text-small ${styles.summary}`}>{skill.summary}</span>
          </motion.li>
        ))}
      </motion.ul>

      {enabled && (
        <div
          className={`${styles.preview} ${active?.preview ? styles.previewVisible : ""}`}
          ref={previewRef}
          aria-hidden="true"
        >
          {active?.preview && (
            // Keyed so switching rows swaps the source rather than reusing a
            // frame that is still holding the previous clip.
            <MediaFrame key={active.preview.key} media={active.preview} alt="" />
          )}
        </div>
      )}
    </section>
  );
}
