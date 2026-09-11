import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Container } from '../layout';
import { Text } from '../typography';
import { useApp } from '../../hooks/useApp';
import { PHASE } from '../../context/app-context';
import { DUR, EASE } from '../../animations/easings';
import { NAV_LINKS, SITE } from '../../data/site';
import './navigation.css';

/**
 * Fixed navigation. It sits back into the hero at the top of the page and
 * resolves to full contrast once the page has moved — one state change, read
 * from the scroll position rather than from a scroll listener per frame.
 *
 * It is the last element to arrive after the preloader, by design.
 */
export function Navigation({ onOpenMenu, triggerRef }) {
  const { phase, menuOpen, reducedMotion } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visible = phase !== PHASE.loading;

  return (
    <motion.header
      className="nav"
      data-scrolled={scrolled}
      initial={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: DUR.mid, delay: reducedMotion ? 0 : 1.5, ease: EASE.outExpo }}
    >
      <Container className="nav__inner">
        <a className="nav__mark" href="#top" aria-label={`${SITE.name} — home`}>
          {SITE.name}
        </a>

        <nav className="nav__links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.id} className="nav__link nav__link--desk" href={link.href} data-cursor="open">
              <Text as="span" variant="label" tone="ink">
                {link.label}
              </Text>
            </a>
          ))}

          <button
            type="button"
            className="nav__menu"
            ref={triggerRef}
            aria-expanded={menuOpen}
            aria-controls="fullscreen-menu"
            onClick={onOpenMenu}
            data-cursor="open"
          >
            <span className="nav__burger" aria-hidden="true">
              <span />
              <span />
            </span>
            <Text as="span" variant="label" tone="ink">
              Menu
            </Text>
          </button>
        </nav>
      </Container>
    </motion.header>
  );
}
