import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_SIGNATURE } from "../../animations/easing.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import { menuLinks, socials } from "../../data/site.js";
import { CHANNEL_ICONS } from "../ui/icons.jsx";
import styles from "./Menu.module.css";

/*
  Fullscreen menu.

  It is a modal surface, so it behaves like one: focus moves into it on open
  and returns to the trigger on close, Escape dismisses it, Tab is trapped
  inside, and the page underneath is locked. Giant type is the easy part —
  this is the part that decides whether it is usable.
*/
export function Menu({ open, onClose, triggerRef }) {
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    // Focus the panel itself rather than the first link, so a screen reader
    // announces the menu before reading its options.
    panelRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Send focus back where it came from, not to the top of the document.
      (triggerRef?.current ?? previouslyFocused)?.focus?.();
    };
  }, [open, onClose, triggerRef]);

  const handleNavigate = useCallback(() => onClose(), [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0.2 : 0.8, ease: EASE_SIGNATURE }}
        >
          <button type="button" className={styles.close} onClick={onClose}>
            Close
          </button>

          <nav className="container" aria-label="Full menu">
            <ul className={styles.list}>
              {menuLinks.map((link, index) => (
                <li className={styles.item} key={link.href}>
                  <motion.a
                    className={styles.link}
                    href={link.href}
                    onClick={handleNavigate}
                    data-cursor="open"
                    initial={reduced ? { opacity: 0 } : { y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: reduced ? 0.2 : 0.7,
                      // Links arrive in sequence behind the panel wipe.
                      delay: reduced ? 0 : 0.25 + index * 0.05,
                      ease: EASE_SIGNATURE,
                    }}
                  >
                    <span className={styles.linkIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>

            <div className={styles.foot}>
              {socials.map((social) => {
                const Icon = CHANNEL_ICONS[social.icon];
                return (
                  <a
                    className={styles.footLink}
                    href={social.href}
                    key={social.label}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                    data-cursor="open"
                  >
                    {Icon && <Icon className={styles.footIcon} />}
                    {social.label}
                  </a>
                );
              })}
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The bar trigger, kept next to the menu it opens. */
export function MenuTrigger({ open, onToggle, triggerRef }) {
  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="dialog"
      ref={triggerRef}
    >
      Menu
      <span className={styles.triggerBars} aria-hidden="true">
        <span className={styles.triggerBar} />
        <span className={styles.triggerBar} />
      </span>
    </button>
  );
}
