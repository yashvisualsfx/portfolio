import { Container } from './Container';

/**
 * A page section. Owns its vertical rhythm, its landmark semantics and its
 * id (used by navigation anchors and, later, by ScrollTrigger ranges).
 */
export function Section({
  id,
  label,
  size = 'default', // 'default' | 'tight' | 'flush'
  viewport = false,
  contained = true,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'section',
    size !== 'default' ? `section--${size}` : '',
    viewport ? 'section--viewport' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const body = contained ? <Container>{children}</Container> : children;

  return (
    <section id={id} aria-label={label} className={classes} {...rest}>
      {body}
    </section>
  );
}
