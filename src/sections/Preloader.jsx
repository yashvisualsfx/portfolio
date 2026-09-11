import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useSpring } from 'motion/react';
import { Text } from '../components/typography';
import { useApp } from '../hooks/useApp';
import { useLoadProgress } from '../hooks/useLoadProgress';
import { completeAll } from '../animations/loader-registry';
import { PHASE } from '../context/app-context';
import { DUR, EASE } from '../animations/easings';
import { SITE } from '../data/site';
import './preloader.css';

/**
 * 01 — CINEMATIC PRELOADER
 *
 * Reports real boot progress (see animations/loader-registry.js), then cuts
 * the screen in two and pulls the halves apart into the hero. The split is
 * timed so the hero's own entrance begins while the panels are still moving —
 * the two are one gesture, not two animations.
 */

const MIN_DISPLAY_MS = 900; // Long enough to read; short enough not to annoy.

export function Preloader() {
  const { phase, setPhase, reducedMotion } = useApp();
  const progress = useLoadProgress();
  const [splitting, setSplitting] = useState(false);
  const digitsRef = useRef(null);
  const mountedAt = useRef(0);

  // The counter chases real progress instead of snapping to it, so the
  // number always reads as motion rather than as a series of jumps.
  const raw = useMotionValue(0);
  const eased = useSpring(raw, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    mountedAt.current = performance.now();
    // A failed chunk, a blocked font or a refused WebGL context must never
    // leave someone staring at a counter.
    const failsafe = setTimeout(completeAll, 9000);
    return () => clearTimeout(failsafe);
  }, []);

  useEffect(() => {
    raw.set(progress);
  }, [progress, raw]);

  useMotionValueEvent(eased, 'change', (value) => {
    if (digitsRef.current) {
      digitsRef.current.textContent = String(Math.round(value * 100)).padStart(2, '0');
    }
  });

  // Hold at 100 for a beat, then split.
  useEffect(() => {
    if (progress < 1 || splitting) return undefined;
    const elapsed = performance.now() - mountedAt.current;
    const wait = Math.max(MIN_DISPLAY_MS - elapsed, 0) + (reducedMotion ? 0 : 420);
    const timer = setTimeout(() => {
      if (digitsRef.current) digitsRef.current.textContent = '100';
      setSplitting(true);
      setPhase(PHASE.revealing);
    }, wait);
    return () => clearTimeout(timer);
  }, [progress, splitting, setPhase, reducedMotion]);

  const split = reducedMotion ? DUR.fast : 1.25;

  // The hero begins its own entrance while the panels are still travelling;
  // the loader only unmounts once the cut has finished clearing the frame.
  useEffect(() => {
    if (!splitting) return undefined;
    const timer = setTimeout(() => setPhase(PHASE.ready), split * 1000);
    return () => clearTimeout(timer);
  }, [splitting, split, setPhase]);

  return (
    <AnimatePresence>
      {phase !== PHASE.ready && (
        <motion.div
          className={`preloader${splitting ? ' preloader--splitting' : ''}`}
          aria-hidden={splitting}
          role="status"
          aria-live="polite"
          initial={false}
          exit={{ opacity: 0, transition: { duration: 0 } }}
        >
          {['top', 'bottom'].map((half, index) => (
            <motion.div
              key={half}
              className={`preloader__panel preloader__panel--${half}`}
              initial={{ y: '0%' }}
              animate={splitting ? { y: index === 0 ? '-101%' : '101%' } : { y: '0%' }}
              transition={{ duration: split, ease: EASE.signature }}
            />
          ))}

          <div className="preloader__inner">
            <motion.div
              className="preloader__mark"
              animate={splitting ? { opacity: 0, scale: reducedMotion ? 1 : 1.04 } : { opacity: 1 }}
              transition={{ duration: DUR.fast, ease: EASE.inQuart }}
            >
              <Text as="p" variant="display">
                {SITE.name}
              </Text>
            </motion.div>

            <motion.div
              animate={splitting ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: DUR.fast }}
            >
              <div className="preloader__count">
                <Text variant="label" tone="ink">
                  Loading
                </Text>
                <Text variant="label" tone="ink" className="preloader__digits">
                  <span ref={digitsRef}>00</span> → 100
                </Text>
              </div>
              <div className="preloader__track">
                <motion.div
                  className="preloader__bar"
                  style={{ scaleX: eased }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
