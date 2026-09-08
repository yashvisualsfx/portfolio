import { motion } from "motion/react";
import { RevealText } from "../components/ui/RevealText.jsx";
import { fadeUp, stagger } from "../animations/variants.js";
import { EASE_SIGNATURE } from "../animations/easing.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { site } from "../data/site.js";
import styles from "./Hero.module.css";

/*
  Intro choreography. Nothing arrives at the same time as anything else — the
  wordmark leads, the supporting copy follows it out of the mask, then the CTA
  and finally the scroll cue. The navigation waits on all of it (App raises
  `visible` when this sequence is done).
*/
const BEAT = {
  eyebrow: 0.1,
  title: 0.25,
  copy: 0.85,
  cta: 1.0,
  cue: 1.2,
};

/**
 * @param {boolean} active  starts the intro — raised by the preloader as its
 *                          panels part, so the hero is already moving when
 *                          it's uncovered.
 */
export function Hero({ active }) {
  const reduced = usePrefersReducedMotion();
  const animate = active ? "visible" : "hidden";

  return (
    <section className={styles.root} id="top" aria-labelledby="hero-title">
      <div className="container">
        <motion.div
          className={styles.inner}
          variants={stagger(0, 0)}
          initial="hidden"
          animate={animate}
        >
          <motion.p
            className={styles.eyebrow}
            variants={fadeUp(reduced, { distance: 12, delay: BEAT.eyebrow })}
          >
            {site.role}
          </motion.p>

          <RevealText
            as="h1"
            id="hero-title"
            className={styles.title}
            lines={[site.name]}
            animate={active}
            delay={BEAT.title}
          />

          <div className={styles.meta}>
            <motion.p className={styles.copy} variants={fadeUp(reduced, { delay: BEAT.copy })}>
              Building visual experiences through{" "}
              <strong>design, motion &amp; technology.</strong>
            </motion.p>

            <motion.a
              className={styles.cta}
              href="#work"
              variants={fadeUp(reduced, { delay: BEAT.cta })}
            >
              Explore Work
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </motion.a>
          </div>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollCue}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, delay: BEAT.cue, ease: EASE_SIGNATURE }}
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollTrack}>
          {/* A pulse travelling down the track — an invitation rather than a
              bouncing arrow. Held still for reduced motion. */}
          <motion.span
            className={styles.scrollBar}
            animate={reduced ? { y: 0, opacity: 1 } : { y: ["-120%", "260%"], opacity: [0, 1, 1, 0] }}
            transition={
              reduced
                ? { duration: 0.3 }
                : { duration: 2.4, repeat: Infinity, ease: EASE_SIGNATURE, repeatDelay: 0.15 }
            }
          />
        </span>
      </motion.div>
    </section>
  );
}
