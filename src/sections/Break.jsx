import { useRef } from 'react';
import { Container, SceneSection } from '../components/layout';
import { Text, MaskLine } from '../components/typography';
import { STATEMENTS } from '../data/site';
import './break.css';

/**
 * 07 — EXPERIMENTAL BREAK
 *
 * A pause between the work and the person: the camera orbits the form for
 * the length of the section and the page contributes two words.
 *
 * The two lines of the statement sit on opposite sides of the canvas — the
 * first in front of the form, the second behind it — so the object passes
 * physically between them. It is the one moment where the depth layering is
 * the content rather than the technique, which is why each line is its own
 * sticky layer rather than two spans in one (see break.css).
 */
export function Break() {
  const ref = useRef(null);
  const [first, second] = STATEMENTS.transition;

  return (
    <SceneSection scene="orbit" label="Ideas in motion" className="break" hold={260} ref={ref}>
      <div className="break__layer break__layer--behind" aria-hidden="true">
        <Container>
          <p className="t-display break__line break__line--behind">
            <MaskLine as="span">{second}</MaskLine>
          </p>
        </Container>
      </div>

      <div className="break__layer break__layer--front">
        <Container>
          <Text variant="label" tone="accent">
            07 — Interlude
          </Text>
        </Container>

        <Container>
          {/* The full statement is announced once; the two visual layers are
              decorative halves of it. */}
          <p className="t-display break__line break__line--front">
            <span className="sr-only">{`${first} ${second}`}</span>
            <MaskLine as="span" aria-hidden="true">
              {first}
            </MaskLine>
          </p>
        </Container>

        <Container className="break__foot">
          <Text variant="label">Real-time — WebGL</Text>
          <Text variant="label">Scroll to orbit</Text>
        </Container>
      </div>
    </SceneSection>
  );
}
