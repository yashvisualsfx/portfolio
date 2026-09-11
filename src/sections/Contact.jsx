import { useRef } from 'react';
import { Container, SceneSection } from '../components/layout';
import { Text, MaskLine, Reveal } from '../components/typography';
import { SITE, SOCIALS, STATEMENTS } from '../data/site';
import './contact.css';

/**
 * 10 — CONTACT FINALE
 *
 * Four lines, one action, four channels. The statement steps in from the
 * left so the block has a diagonal edge rather than a justified one, and the
 * last line carries the only full-strength accent in the site.
 *
 * No 3D here: by this point the visitor has come to read a sentence and act
 * on it, and a moving object behind the words only competes with them.
 */
export function Contact() {
  const ref = useRef(null);
  const lines = STATEMENTS.contact;

  return (
    <SceneSection id="contact" scene="finale" label="Contact" className="contact" ref={ref}>
      <Container className="layer-front">
        <h2 className="contact__lines">
          <span className="sr-only">{lines.join(' ')}</span>
          {lines.map((line, index) => (
            <span className="contact__line" data-line={index} key={line} aria-hidden="true">
              <MaskLine as="span" delay={index * 0.07}>
                {line}
              </MaskLine>
            </span>
          ))}
        </h2>

        <Reveal>
          <a
            className="contact__cta"
            href={`mailto:${SITE.email}`}
            data-cursor="open"
          >
            <span className="contact__cta-label">Start a project</span>
            <span className="contact__cta-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </Reveal>

        <ul className="contact__channels">
          {SOCIALS.map((social, index) => (
            <li key={social.id}>
              <Reveal delay={index * 0.05}>
                <a
                  className="contact__channel"
                  href={social.href}
                  data-cursor="open"
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <Text as="span" variant="label" tone="ink">
                    {social.label}
                  </Text>
                  <Text as="span" variant="small" tone="dim">
                    {social.handle}
                  </Text>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </SceneSection>
  );
}

export function Footer() {
  return (
    <footer className="content">
      <Container className="footer layer-front">
        <Text variant="label" tone="ink">
          {SITE.name} © {SITE.year}
        </Text>
        <Text variant="label">{SITE.footerNote}</Text>
        <Text variant="label">{SITE.timezone}</Text>
      </Container>
    </footer>
  );
}
