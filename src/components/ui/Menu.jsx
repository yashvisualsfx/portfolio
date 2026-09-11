import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Text } from '../typography';
import { useApp } from '../../hooks/useApp';
import { DUR, EASE, STAGGER } from '../../animations/easings';
import { MENU_LINKS, SITE, SOCIALS } from '../../data/site';
import './navigation.css';

/**
 * Fullscreen menu. Destinations are stated at display size; the panel wipes
 * in from the top and the links rise out of their own masks behind it.
 *
 * Focus is trapped while open and returned to the trigger on close, and
 * Escape always closes — the menu covers the whole document, so it has to
 * behave like the dialog it is.
 */
export function Menu({ triggerRef }) {
  const { menuOpen, closeMenu, reducedMotion } = useApp();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const panel = panelRef.current;
    const focusables = () =>
      panel?.querySelectorAll('a[href], button:not([disabled])') ?? [];

    focusables()[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        triggerRef?.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = [...focusables()];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu, triggerRef]);

  const onNavigate = () => {
    closeMenu();
  };

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          id="fullscreen-menu"
          className="menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: reducedMotion ? DUR.fast : 0.9, ease: EASE.signature }}
        >
          <div />

          <motion.ul
            className="menu__list"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: reducedMotion ? 0 : STAGGER.base,
                  delayChildren: reducedMotion ? 0 : 0.22,
                },
              },
            }}
          >
            {MENU_LINKS.map((link) => (
              <li className="menu__item" key={link.id}>
                <a className="menu__link" href={link.href} onClick={onNavigate} data-cursor="open">
                  <Text as="span" variant="index">
                    {link.index}
                  </Text>
                  <span className="mask">
                    <motion.span
                      className="menu__label t-display"
                      variants={{
                        hidden: reducedMotion ? { opacity: 0 } : { y: '105%' },
                        visible: {
                          y: '0%',
                          opacity: 1,
                          transition: { duration: DUR.slow, ease: EASE.signature },
                        },
                      }}
                    >
                      {link.label}
                    </motion.span>
                  </span>
                </a>
              </li>
            ))}
          </motion.ul>

          <div className="menu__foot">
            <Text variant="label">{SITE.availability}</Text>
            <div className="menu__socials">
              {SOCIALS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  className="t-link"
                  data-cursor="open"
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <Text as="span" variant="label" tone="ink">
                    {social.label}
                  </Text>
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
