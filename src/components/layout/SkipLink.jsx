/** First tab stop on the page — jumps past the fixed navigation. */
export function SkipLink({ href = '#main' }) {
  return (
    <a className="skip-link" href={href}>
      Skip to content
    </a>
  );
}
