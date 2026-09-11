import { useRef } from 'react';
import { Container, SceneSection } from '../components/layout';
import { MaskLine } from '../components/typography';
import { Marquee } from '../components/ui/Marquee';
import { MARQUEE_WORDS, STATEMENTS } from '../data/site';
import './statement.css';

/**
 * 09 — MARQUEE / STATEMENT
 *
 * An infinite line whose speed is tied to the visitor's own scrolling, then
 * a three-word statement set across the full frame.
 *
 * All three words sit in front. The middle one used to sit behind the canvas
 * with a slab passing through the sentence; that cost a third of the
 * statement's legibility to buy one moment of depth, which is a bad trade on
 * the line the whole section exists to deliver.
 */
export function Statement() {
  const ref = useRef(null);
  const [first, second, third] = STATEMENTS.marquee;

  return (
    <SceneSection scene="statement" label="Make it memorable" className="statement" ref={ref}>
      <div className="statement__marquee layer-front">
        <Marquee words={MARQUEE_WORDS} />
      </div>

      <div className="statement__stage">
        <div className="statement__layer statement__layer--front">
          <Container>
            <p className="statement__line statement__line--1">
              <span className="sr-only">{`${first} ${second} ${third}`}</span>
              <MaskLine as="span" aria-hidden="true">
                {first}
              </MaskLine>
            </p>
            <p className="statement__line statement__line--2" aria-hidden="true">
              <MaskLine as="span" delay={0.06}>
                {second}
              </MaskLine>
            </p>
            <p className="statement__line statement__line--3" aria-hidden="true">
              <MaskLine as="span" delay={0.12}>
                {third}
              </MaskLine>
            </p>
          </Container>
        </div>
      </div>
    </SceneSection>
  );
}
