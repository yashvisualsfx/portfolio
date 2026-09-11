import { motion } from 'motion/react';
import { fadeUp, inViewProps, IN_VIEW_EARLY } from '../../animations/variants';
import { useApp } from '../../hooks/useApp';

/**
 * Generic entrance for supporting copy and interface furniture: short
 * travel, soft curve. Headings use <MaskLine> instead.
 */
export function Reveal({
  as: Tag = 'div',
  trigger = 'inView',
  delay = 0,
  duration,
  distance,
  className = '',
  children,
  ...rest
}) {
  const { reducedMotion } = useApp();
  const variants = fadeUp({ delay, duration, distance, reduced: reducedMotion });
  const Component = motion[Tag] ?? motion.div;

  const orchestration =
    trigger === 'parent'
      ? {}
      : trigger === 'mount'
        ? { initial: 'hidden', animate: 'visible' }
        : inViewProps(reducedMotion, IN_VIEW_EARLY);

  return (
    <Component className={className} variants={variants} {...orchestration} {...rest}>
      {children}
    </Component>
  );
}
