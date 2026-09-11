/** The editorial grid: 6 columns on phones, 12 from 768px up. */
export function Grid({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`grid${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * A column span. `span` is the desktop span; `spanSm` (out of 6) lets a
 * layout restate itself for phones instead of merely shrinking.
 */
export function Col({ as: Tag = 'div', span = 12, spanSm, start, className = '', style, children, ...rest }) {
  const inline = start ? { ...style, gridColumnStart: start } : style;

  return (
    <Tag
      className={`col-${span}${spanSm ? ` col-sm-${spanSm}` : ''}${className ? ` ${className}` : ''}`}
      style={inline}
      {...rest}
    >
      {children}
    </Tag>
  );
}
