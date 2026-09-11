import { motion } from 'motion/react';
import { maskRise, inViewProps } from '../../animations/variants';
import { useApp } from '../../hooks/useApp';

/**
 * A single line of type rising out of a clipping mask — the site's primary
 * heading reveal.
 *
 * `trigger`:
 *   'inView'  reveal when the line scrolls into view (default)
 *   'parent'  stay silent and let a parent variant orchestration drive it
 *   'mount'   reveal immediately (hero, preloader handoff)
 *
 * Reduced motion collapses the travel to a plain fade automatically.
 */
export function MaskLine({
  as: Tag = 'span',
  trigger = 'inView',
  delay = 0,
  duration,
  distance,
  className = '',
  innerClassName = '',
  children,
  ...rest
}) {
  const { reducedMotion } = useApp();
  const variants = maskRise({ delay, duration, distance, reduced: reducedMotion });

  const Inner = motion[Tag] ?? motion.span;

  const orchestration =
    trigger === 'parent'
      ? {}
      : trigger === 'mount'
        ? { initial: 'hidden', animate: 'visible' }
        : inViewProps(reducedMotion);

  return (
    <span className={`mask${className ? ` ${className}` : ''}`} {...rest}>
      <Inner className={innerClassName} variants={variants} {...orchestration}>
        {children}
      </Inner>
    </span>
  );
}
