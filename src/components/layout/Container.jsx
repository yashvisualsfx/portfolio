/** Page margins. Every section's content sits inside one of these. */
export function Container({ as: Tag = 'div', flush = false, className = '', children, ...rest }) {
  return (
    <Tag className={`container${flush ? ' container--flush' : ''}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </Tag>
  );
}
