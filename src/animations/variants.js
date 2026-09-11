/**
 * Reusable Motion variants. Sections describe *what* reveals; these describe
 * *how*, so the choreography stays identical across the whole site and can be
 * tuned in one place.
 *
 * Every factory takes `reduced` and returns a simple opacity fade when the
 * visitor has asked for reduced motion.
 */

import { DUR, EASE, STAGGER } from './easings';

const fade = (duration = DUR.fast) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration } },
});

/** Parent that releases its children one after another. */
export const staggerParent = ({
  stagger = STAGGER.base,
  delay = 0,
  reduced = false,
} = {}) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: reduced ? 0 : stagger,
      delayChildren: reduced ? 0 : delay,
    },
  },
});

/**
 * Type rising out of a clipping mask — the site's primary heading reveal.
 * Must be used inside an element carrying the `.mask` class.
 */
export const maskRise = ({
  duration = DUR.slow,
  delay = 0,
  distance = '105%',
  reduced = false,
} = {}) => {
  if (reduced) return fade();
  return {
    hidden: { y: distance },
    visible: {
      y: '0%',
      transition: { duration, delay, ease: EASE.signature },
    },
  };
};

/** Supporting copy and interface furniture: short travel, soft exit curve. */
export const fadeUp = ({
  duration = DUR.mid,
  delay = 0,
  distance = 24,
  reduced = false,
} = {}) => {
  if (reduced) return fade();
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, delay, ease: EASE.outExpo },
    },
  };
};

/** Media reveal: the image is uncovered rather than faded in. */
export const clipReveal = ({
  duration = DUR.cine,
  delay = 0,
  from = 'inset(0% 0% 100% 0%)',
  reduced = false,
} = {}) => {
  if (reduced) return fade();
  return {
    hidden: { clipPath: from },
    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration, delay, ease: EASE.signature },
    },
  };
};

/** A hairline rule drawing itself across the layout. */
export const drawRule = ({ duration = DUR.slow, delay = 0, reduced = false } = {}) => {
  if (reduced) return fade();
  return {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration, delay, ease: EASE.signature },
    },
  };
};

/** Shared viewport config so sections trigger at a consistent depth. */
export const IN_VIEW = { once: true, amount: 0.35 };
export const IN_VIEW_EARLY = { once: true, amount: 0.15 };

/**
 * Orchestration props for a scroll-triggered reveal.
 *
 * Under reduced motion the reveal is promoted to a plain on-mount fade: a
 * visitor who jumps the page (anchor link, restored scroll position, an
 * assistive tool moving focus) can never land on content that is still
 * waiting for an intersection it will not receive.
 */
export const inViewProps = (reduced, viewport = IN_VIEW) =>
  reduced
    ? { initial: 'hidden', animate: 'visible' }
    : { initial: 'hidden', whileInView: 'visible', viewport };
