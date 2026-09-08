import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { EASE_SIGNATURE } from "../../animations/easing.js";
import { useAssetLoader } from "../../hooks/useAssetLoader.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import { site } from "../../data/site.js";
import styles from "./Preloader.module.css";

/**
 * The opening. Two panels hold the screen while the display font and the
 * first screen's imagery resolve, then part like a curtain to hand off to the
 * hero already animating behind them.
 *
 * @param {string[]} sources  assets to wait on before revealing
 * @param {() => void} onReveal   fires as the panels start parting — the hero
 *                                begins its intro underneath, so the two reads
 *                                as one continuous move
 * @param {() => void} onComplete fires once the panels are clear
 */
export function Preloader({ sources, onReveal, onComplete }) {
  const reduced = usePrefersReducedMotion();
  const { progress, ready } = useAssetLoader(sources, {
    minDuration: reduced ? 400 : 1800,
  });

  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // The raw progress steps as assets land; the spring smooths it into a
  // count that climbs rather than jumping between numbers.
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 55, damping: 20, restDelta: 0.0005 });
  const counter = useTransform(smooth, (value) =>
    Math.round(Math.min(value, 1) * 100)
      .toString()
      .padStart(2, "0"),
  );

  useEffect(() => {
    raw.set(progress);
  }, [progress, raw]);

  useEffect(() => {
    if (!ready) return undefined;
    // Hold on 100 for a beat before the split — landing and leaving in the
    // same frame reads as a glitch rather than a cut.
    const timer = setTimeout(
      () => {
        setExiting(true);
        onReveal?.();
      },
      reduced ? 120 : 460,
    );
    return () => clearTimeout(timer);
  }, [ready, onReveal, reduced]);

  if (dismissed) return null;

  const finish = () => {
    setDismissed(true);
    onComplete?.();
  };

  // Reduced motion: no curtain, no travel — the overlay simply clears.
  if (reduced) {
    return (
      <motion.div
        className={styles.root}
        style={{ background: "var(--color-bg)", pointerEvents: exiting ? "none" : "auto" }}
        role="status"
        aria-live="polite"
        initial={{ opacity: 1 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => exiting && finish()}
      >
        <div className={styles.inner}>
          <span className={styles.wordmark}>{site.name}</span>
          <span className="visually-hidden">Loading</span>
          <div className={styles.counter} aria-hidden="true">
            <motion.span className={styles.counterValue}>{counter}</motion.span>
            <span className={styles.counterArrow}>→</span>
            <span className={styles.counterTarget}>100</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className={styles.root}
      style={{ pointerEvents: exiting ? "none" : "auto" }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className={`${styles.panel} ${styles.panelTop}`}
        initial={{ y: 0 }}
        animate={{ y: exiting ? "-100%" : 0 }}
        transition={{ duration: 1.15, ease: EASE_SIGNATURE }}
      />
      <motion.div
        className={`${styles.panel} ${styles.panelBottom}`}
        initial={{ y: 0 }}
        animate={{ y: exiting ? "100%" : 0 }}
        transition={{ duration: 1.15, ease: EASE_SIGNATURE }}
        onAnimationComplete={() => exiting && finish()}
      />

      <motion.div
        className={styles.inner}
        initial={{ opacity: 1 }}
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? -20 : 0 }}
        transition={{ duration: 0.5, ease: EASE_SIGNATURE }}
      >
        <span className={styles.wordmark}>{site.name}</span>
        <span className="visually-hidden">Loading</span>
        <div className={styles.counter} aria-hidden="true">
          <motion.span className={styles.counterValue}>{counter}</motion.span>
          <span className={styles.counterArrow}>→</span>
          <span className={styles.counterTarget}>100</span>
        </div>
      </motion.div>

      <motion.div
        className={styles.track}
        aria-hidden="true"
        initial={{ opacity: 1 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div className={styles.bar} style={{ scaleX: smooth }} />
      </motion.div>
    </div>
  );
}
