import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { RevealText } from "../components/ui/RevealText.jsx";
import { fadeUp, stagger, inView } from "../animations/variants.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { primaryContact, site, socials } from "../data/site.js";
import styles from "./Contact.module.css";

/*
  The finale. As this comes into view it publishes its progress to the shared
  sequence ref, and the 3D scene settles into its final composition — the
  world coming to rest rather than simply scrolling out of frame.
*/
export function Contact({ sequenceRef }) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !sequenceRef) return undefined;

    if (reduced) {
      sequenceRef.current.contact = 1;
      return undefined;
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          sequenceRef.current.contact = self.progress;
        },
      });
    }, section);

    return () => {
      context.revert();
      sequenceRef.current.contact = 0;
    };
  }, [reduced, sequenceRef]);

  return (
    <section
      className={`container ${styles.root}`}
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-heading"
    >
      <span className="text-micro">Contact</span>

      <RevealText
        as="h2"
        id="contact-heading"
        className={styles.heading}
        lines={["Let's", "Make", "Something", "Unforgettable."]}
      />

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        {/* Points at email when there is one, otherwise the first channel
            that resolves — see primaryContact. */}
        <motion.a
          className={styles.cta}
          href={primaryContact?.href}
          target={primaryContact?.href?.startsWith("http") ? "_blank" : undefined}
          rel={primaryContact?.href?.startsWith("http") ? "noreferrer" : undefined}
          variants={fadeUp(reduced)}
          data-cursor="open"
        >
          Start a project
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </motion.a>

        <motion.div className={styles.channels} variants={fadeUp(reduced)}>
          {socials.map((social) => (
            <div className={styles.channel} key={social.label}>
              <span className="text-micro">{social.label}</span>
              <a
                className={styles.channelLink}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                data-cursor="open"
              >
                {social.handle}
              </a>
            </div>
          ))}
        </motion.div>

        <motion.footer className={styles.footer} variants={fadeUp(reduced)}>
          <span className="text-small">
            {site.name} © {site.year}
          </span>
          <span className="text-small">Designed &amp; developed with intention</span>
        </motion.footer>
      </motion.div>
    </section>
  );
}
