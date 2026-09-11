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
 * Both lines sit in front of the form. They used to straddle it — one layer
 * either side of the canvas — which looked striking in a screenshot and hid
 * half the sentence in motion. The form reads as behind because it is, and
 * the words stay readable the whole way through.
 */
export function Break() {
  const ref = useRef(null);
  const [first, second] = STATEMENTS.transition;

  return (
    <SceneSection scene="orbit" label="Ideas in motion" className="break" hold={260} ref={ref}>
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
            <MaskLine as="span" delay={0.1} aria-hidden="true">
              {second}
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
