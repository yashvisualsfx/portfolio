import { motion } from 'motion/react';
import { maskRise } from '../../animations/variants';
import { useApp } from '../../hooks/useApp';
import { useRevealed } from '../../hooks/useRevealed';

/**
 * A single line of type rising out of a clipping mask — the site's primary
 * heading reveal.
 *
 * The mask (which never moves) carries the trigger and the child inherits
 * the variant from it. Observing the inner element instead would deadlock:
 * it starts translated a full line below the mask, so a heading entering
 * near the bottom of the viewport would never intersect, and so would never
 * be told to rise into view.
 *
 * `trigger`:
 *   'inView'      reveal when the line scrolls into view (default)
 *   'parent'      stay silent and let a parent variant orchestration drive it
 *   'mount'       reveal immediately
 *   'controlled'  reveal when the `active` prop turns true (preloader handoff)
 */
export function MaskLine({
  as: Tag = 'span',
  trigger = 'inView',
  active = false,
  delay = 0,
  duration,
  distance,
  amount = 0.3,
  className = '',
  innerClassName = '',
  children,
  ...rest
}) {
  const { reducedMotion } = useApp();
  const [ref, revealed] = useRevealed({ amount, enabled: trigger === 'inView' });
  const variants = maskRise({ delay, duration, distance, reduced: reducedMotion });

  const Inner = motion[Tag] ?? motion.span;

  const orchestration =
    trigger === 'parent'
      ? {}
      : trigger === 'mount'
        ? { initial: 'hidden', animate: 'visible' }
        : trigger === 'controlled'
          ? { initial: 'hidden', animate: active ? 'visible' : 'hidden' }
          : { initial: 'hidden', animate: revealed ? 'visible' : 'hidden' };

  return (
    <motion.span
      ref={trigger === 'inView' ? ref : undefined}
      className={`mask${className ? ` ${className}` : ''}`}
      {...orchestration}
      {...rest}
    >
      <Inner className={innerClassName} variants={variants}>
        {children}
      </Inner>
    </motion.span>
  );
}
