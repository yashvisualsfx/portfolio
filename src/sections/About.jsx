import { useRef } from 'react';
import { Container, SceneSection } from '../components/layout';
import { Text, MaskLine, Reveal } from '../components/typography';
import { useApp } from '../hooks/useApp';
import { useScrollChoreography } from '../animations/useScrollChoreography';
import { gsap } from '../animations/gsap-setup';
import { ABOUT } from '../data/about';
import { SITE } from '../data/site';
import './about.css';

/**
 * 08 — ABOUT
 *
 * Asymmetric on purpose: the portrait holds a narrow sticky column on the
 * left while the writing runs long on the right, so the section reads like a
 * spread rather than a profile card.
 *
 * The portrait is overscaled and parallaxed inside its own frame, which is
 * what gives a still image depth without resorting to a tilt effect.
 */
export function About() {
  const ref = useRef(null);
  const { reducedMotion } = useApp();

  useScrollChoreography(
    ref,
    (_, section) => {
      gsap.fromTo(
        section.querySelector('.about__portrait img'),
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: {
            trigger: section.querySelector('.about__portrait'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      );
    },
    { enabled: !reducedMotion, deps: [reducedMotion] },
  );

  return (
    <SceneSection id="about" scene="about" label={`About ${SITE.name}`} className="section" ref={ref}>
      <Container className="layer-front">
        <header className="about__head">
          <h2 className="t-display">
            <span className="sr-only">About {SITE.name}</span>
            <MaskLine as="span" aria-hidden="true">About</MaskLine>
            <MaskLine as="span" delay={0.08} aria-hidden="true">
              {SITE.name}
            </MaskLine>
          </h2>
          <Reveal>
            <Text variant="lead" style={{ maxWidth: '26ch' }}>
              {ABOUT.statement}
            </Text>
          </Reveal>
        </header>

        <div className="about__grid">
          <figure className="about__media">
            <div className="about__portrait">
              <img
                src={ABOUT.portrait.small}
                srcSet={`${ABOUT.portrait.small} 1024w, ${ABOUT.portrait.src} 1242w`}
                sizes="(min-width: 768px) 32vw, 100vw"
                alt={ABOUT.portrait.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="about__caption">
              <Text as="span" variant="label">
                {SITE.name}
              </Text>
              <Text as="span" variant="label">
                {SITE.location}
              </Text>
            </figcaption>
          </figure>

          <div className="about__body">
            {ABOUT.paragraphs.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.06}>
                <Text variant="body" style={{ maxWidth: '52ch' }}>
                  {paragraph}
                </Text>
              </Reveal>
            ))}

            <Reveal delay={0.12}>
              <dl className="about__facts">
                {ABOUT.facts.map((fact) => (
                  <div className="about__fact" key={fact.label}>
                    <Text as="dt" variant="label">
                      {fact.label}
                    </Text>
                    <Text as="dd" variant="small">
                      {fact.value}
                    </Text>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="about__tools">
                <Text as="span" variant="label" tone="accent">
                  Selected tools
                </Text>
                {ABOUT.tools.map((tool) => (
                  <Text as="span" variant="label" key={tool}>
                    {tool}
                  </Text>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </SceneSection>
  );
}
