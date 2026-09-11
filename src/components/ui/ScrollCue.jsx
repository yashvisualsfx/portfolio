import { Text } from '../typography';
import './scroll-cue.css';

/** A quiet indication that the page is a journey, not a screen. */
export function ScrollCue({ label = 'Scroll' }) {
  return (
    <div className="scroll-cue" aria-hidden="true">
      <span className="scroll-cue__track">
        <span className="scroll-cue__seg" />
      </span>
      <Text as="span" variant="label">
        {label}
      </Text>
    </div>
  );
}
