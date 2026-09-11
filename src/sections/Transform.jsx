import { useRef } from 'react';
import { SceneSection } from '../components/layout';
import { Text, SplitWord } from '../components/typography';
import { useApp } from '../hooks/useApp';
import { useScrollChoreography } from '../animations/useScrollChoreography';
import { gsap } from '../animations/gsap-setup';
import { GSAP_EASE } from '../animations/easings';
import './transform.css';

/**
 * 03 — SCROLL TRANSFORMATION
 *
 * The signature sequence, and deliberately almost empty: this is where the
 * monolith opens and the camera flies through it, so the DOM contributes one
 * line of type and a progress readout and otherwise gets out of the way.
 *
 * The section is pure scroll distance (a tall block with a sticky frame), so
 * the 3D choreography has room to breathe without the page feeling padded.
 */
export function Transform() {
  const ref = useRef(null);
  const { reducedMotion } = useApp();

  useScrollChoreography(
    ref,
    (_, section) => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5 },
      });

      timeline
        .fromTo('.transform__fill', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)
        // The line is present only through the middle of the pass — it
        // arrives after the stack has started to open and leaves before the
        // camera clears it.
        .fromTo(
          '.transform__line',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, ease: GSAP_EASE.outExpo },
          0.22,
        )
        .to('.transform__line', { opacity: 0, y: -40, ease: GSAP_EASE.signature }, 0.68);
    },
    { enabled: !reducedMotion, deps: [reducedMotion] },
  );

  return (
    <SceneSection
      scene="transform"
      label="Passing through"
      className="transform"
      hold={260}
      ref={ref}
    >
      <div className="transform__sticky layer-front">
        <div className="transform__line">
          <Text as="p" variant="h1">
            <SplitWord word="Built" active />
            <br />
            <SplitWord word="frame by frame." active />
          </Text>
        </div>

        <div className="transform__readout">
          <Text variant="label">Entering</Text>
          <span className="transform__track" aria-hidden="true">
            <span className="transform__fill" />
          </span>
          <Text variant="label" tone="accent">
            Selected Work
          </Text>
        </div>
      </div>
    </SceneSection>
  );
}
