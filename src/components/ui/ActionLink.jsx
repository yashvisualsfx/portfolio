import './action-link.css';

/**
 * The site's only call to action shape: a label, a hairline and an arrow.
 * No pill, no fill, no radius — the type carries it.
 */
export function ActionLink({
  as: Tag = 'a',
  size = 'default',
  arrow = '→',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`action${size === 'display' ? ' action--display' : ''}${className ? ` ${className}` : ''}`}
      data-cursor="open"
      {...rest}
    >
      <span className="action__label">{children}</span>
      <span className="action__arrow" aria-hidden="true">
        {arrow}
      </span>
    </Tag>
  );
}
