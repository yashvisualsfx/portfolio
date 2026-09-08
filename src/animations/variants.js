import { EASE_SIGNATURE, EASE_OUT_EXPO, DURATION } from "./easing.js";

/*
  Shared Motion variants. Every reveal in the site composes these rather than
  re-declaring transforms, so the whole page speaks one motion language and a
  timing change lands everywhere at once.

  Each factory takes `reduced` and returns a fade-only version when the user
  has asked for reduced motion — the content still arrives, it just stops
  travelling.
*/

/** Line of type sliding up out of a mask. Pair with `.maskLine` overflow wrapper. */
export const maskLine = (reduced) => ({
  hidden: reduced ? { opacity: 0 } : { y: "110%", opacity: 1 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: reduced ? DURATION.fast : 1,
      ease: EASE_SIGNATURE,
    },
  },
});

/**
 * Supporting copy and UI: a short lift with a fade.
 *
 * `delay` belongs in the variant rather than on a `transition` prop — a
 * variant's own transition wins over the prop, so a delay passed that way
 * would be silently dropped.
 */
export const fadeUp = (reduced, { distance = 24, delay = 0 } = {}) => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reduced ? DURATION.fast : DURATION.base,
      ease: EASE_OUT_EXPO,
      delay,
    },
  },
});

/** Horizontal rules and progress lines drawing themselves in. */
export const drawLine = (reduced) => ({
  hidden: reduced ? { opacity: 0 } : { scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: reduced ? DURATION.fast : DURATION.slow, ease: EASE_SIGNATURE },
  },
});

/** Parent orchestrator — children animate in sequence, never all at once. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Standard viewport trigger for scroll-entered sections. */
export const inView = { once: true, amount: 0.35 };
