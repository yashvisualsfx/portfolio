import { motion } from 'motion/react';
import { fadeUp } from '../../animations/variants';
import { useApp } from '../../hooks/useApp';
import { useRevealed } from '../../hooks/useRevealed';

/**
 * Generic entrance for supporting copy and interface furniture: short
 * travel, soft curve. Headings use <MaskLine> instead.
 */
export function Reveal({
  as: Tag = 'div',
  trigger = 'inView',
  active = false,
  delay = 0,
  duration,
  distance,
  amount = 0.15,
  className = '',
  children,
  ...rest
}) {
  const { reducedMotion } = useApp();
  const [ref, revealed] = useRevealed({ amount, enabled: trigger === 'inView' });
  const variants = fadeUp({ delay, duration, distance, reduced: reducedMotion });
  const Component = motion[Tag] ?? motion.div;

  const orchestration =
    trigger === 'parent'
      ? {}
      : trigger === 'mount'
        ? { initial: 'hidden', animate: 'visible' }
        : trigger === 'controlled'
          ? { initial: 'hidden', animate: active ? 'visible' : 'hidden' }
          : { initial: 'hidden', animate: revealed ? 'visible' : 'hidden' };

  return (
    <Component
      ref={trigger === 'inView' ? ref : undefined}
      className={className}
      variants={variants}
      {...orchestration}
      {...rest}
    >
      {children}
    </Component>
  );
}
