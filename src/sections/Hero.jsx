import { useRef } from 'react';
import { motion } from 'motion/react';
import { Container, SceneSection } from '../components/layout';
import { Text, SplitWord } from '../components/typography';
import { ActionLink, ScrollCue } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { PHASE } from '../context/app-context';
import { DUR, EASE, GSAP_EASE } from '../animations/easings';
import { useScrollChoreography } from '../animations/useScrollChoreography';
import { gsap } from '../animations/gsap-setup';
import { SITE } from '../data/site';
import './hero.css';

/**
 * 02 — HERO  ·  03 — the opening of the transformation
 *
 * Nothing animates at once. The wordmark arrives letter by letter, the
 * supporting copy follows, the action lands after that and the navigation
 * comes last — while the form is still turning into position behind it.
 *
 * Then, as soon as the page moves, the letters begin to draw apart and the
 * interface recedes: the hero does not "scroll away", it opens.
 */

const BEAT = { word: 0.15, copy: 0.8, meta: 1, action: 1.1, cue: 1.35 };

export function Hero() {
  const { phase, reducedMotion } = useApp();
  const sectionRef = useRef(null);
  const started = phase !== PHASE.loading;
  const beat = (value) => (reducedMotion ? 0 : value);

  useScrollChoreography(
    sectionRef,
    (_, section) => {
      const letters = gsap.utils.toArray('.split__inner', section);
      const middle = (letters.length - 1) / 2;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });

      timeline
        .to(
          letters,
          {
            // Outer letters travel furthest: the word opens rather than slides.
            xPercent: (index) => (index - middle) * 46,
            opacity: 0.08,
            ease: GSAP_EASE.signature,
          },
          0,
        )
        .to('.hero__foot', { opacity: 0, y: -24, ease: 'none' }, 0);
    },
    { enabled: !reducedMotion, deps: [reducedMotion] },
  );

  return (
    <SceneSection
      id="top"
      scene="hero"
      label="Introduction"
      className="hero"
      ref={sectionRef}
    >
      <div className="hero__type layer-front">
        <h1 className="t-mega hero__word">
          <SplitWord
            word={SITE.name}
            active={started}
            delay={beat(BEAT.word)}
            duration={reducedMotion ? DUR.fast : 1.25}
          />
        </h1>
      </div>

      <Container className="hero__foot layer-front">
        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DUR.slow, delay: beat(BEAT.copy), ease: EASE.outExpo }}
        >
          <Text variant="label" tone="accent">
            {SITE.role}
          </Text>
          <Text variant="lead">{SITE.tagline}</Text>
        </motion.div>

        <div className="hero__actions">
          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: DUR.mid, delay: beat(BEAT.meta), ease: EASE.outExpo }}
          >
            <Text variant="label">{SITE.location}</Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: DUR.mid, delay: beat(BEAT.action), ease: EASE.outExpo }}
          >
            <ActionLink href="#work">Explore Work</ActionLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={started ? { opacity: 1 } : {}}
            transition={{ duration: DUR.mid, delay: beat(BEAT.cue) }}
          >
            <ScrollCue />
          </motion.div>
        </div>
      </Container>
    </SceneSection>
  );
}
