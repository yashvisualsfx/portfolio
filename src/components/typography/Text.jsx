const VARIANT_CLASS = {
  mega: 't-mega',
  display: 't-display',
  h1: 't-h1',
  h2: 't-h2',
  h3: 't-h3',
  lead: 't-lead',
  body: 't-body',
  small: 't-small',
  label: 't-label',
  index: 't-index',
};

const TONE_CLASS = {
  ink: '',
  dim: 't-dim',
  faint: 't-faint',
  accent: 't-accent',
  outline: 't-outline',
};

/**
 * The typographic scale as a component. Sections pick a role
 * ("this is a display heading"), never a font size — so the scale can be
 * retuned globally without touching a single section.
 */
export function Text({
  as: Tag = 'p',
  variant = 'body',
  tone = 'ink',
  className = '',
  children,
  ...rest
}) {
  const classes = [VARIANT_CLASS[variant], TONE_CLASS[tone], className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
