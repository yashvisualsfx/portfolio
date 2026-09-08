import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { EASE_SIGNATURE } from "../../animations/easing.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import { navLinks, site } from "../../data/site.js";
import { Menu, MenuTrigger } from "./Menu.jsx";
import styles from "./Navigation.module.css";

/**
 * Minimal fixed navigation. It sits transparent over the hero and only gains
 * its rule and blur once the page has moved — presence when it's needed,
 * silence when it isn't.
 *
 * @param {boolean} visible  held false until the hero intro has played, so
 *                           the navigation is the last thing to arrive
 */
export function Navigation({ visible = true }) {
  const reduced = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => {
    // Hysteresis: a single threshold flickers when scrolling around it.
    setScrolled((current) => (current ? value > 40 : value > 120));
  });

  return (
    <motion.header
      className={`${styles.root} ${scrolled ? styles.scrolled : ""}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : -16 }}
      transition={{ duration: reduced ? 0.3 : 0.9, ease: EASE_SIGNATURE }}
    >
      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.brand} aria-label={`${site.name} — back to top`}>
          {site.name}
        </a>

        <nav aria-label="Primary">
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <MenuTrigger
                open={menuOpen}
                onToggle={() => setMenuOpen((current) => !current)}
                triggerRef={triggerRef}
              />
            </li>
          </ul>
        </nav>
      </div>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={triggerRef} />
    </motion.header>
  );
}
