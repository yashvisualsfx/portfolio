import { motion } from 'motion/react';
import { Container } from '../components/layout';
import { Text, MaskLine } from '../components/typography';
import { ActionLink, ScrollCue } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { PHASE } from '../context/app-context';
import { DUR, EASE } from '../animations/easings';
import { SITE } from '../data/site';
import './hero.css';

/**
 * 02 — HERO
 *
 * Nothing animates at once. The wordmark clears its mask first, the
 * supporting copy follows, the action arrives after that and the navigation
 * lands last — while the 3D form is still rotating into position behind it.
 *
 * The beats are offsets from the moment the preloader begins its split, so
 * the two read as one continuous move.
 */

const BEAT = {
  word: 0.15,
  copy: 0.75,
  meta: 0.95,
  action: 1.05,
  cue: 1.3,
};

export function Hero() {
  const { phase, reducedMotion } = useApp();
  const started = phase !== PHASE.loading;
  const beat = (value) => (reducedMotion ? 0 : value);

  return (
    <section id="top" className="hero" aria-label="Introduction">
      <div className="hero__type layer-behind">
        <h1 className="t-mega hero__word">
          <MaskLine
            as="span"
            trigger="controlled"
            active={started}
            duration={reducedMotion ? DUR.fast : 1.4}
            delay={beat(BEAT.word)}
          >
            {SITE.name}
          </MaskLine>
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
    </section>
  );
}
