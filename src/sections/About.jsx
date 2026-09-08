import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { MediaFrame } from "../components/ui/MediaFrame.jsx";
import { RevealText } from "../components/ui/RevealText.jsx";
import { fadeUp, stagger, inView } from "../animations/variants.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { site, tools } from "../data/site.js";
import { sceneMedia } from "../data/projects.js";
import styles from "./About.module.css";

/*
  Editorial, asymmetric, and deliberately off-baseline: the portrait column
  starts lower than the text so the two never line up into a CV layout.
*/
export function About() {
  const reduced = usePrefersReducedMotion();
  const portraitRef = useRef(null);

  // Portrait drifts against the page as it passes — enough to register as
  // depth, not enough to notice as an effect.
  const { scrollYProgress } = useScroll({
    target: portraitRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);

  const facts = [
    { label: "Based in", value: site.location },
    { label: "Experience", value: site.experience },
    { label: "Availability", value: site.availability },
  ];

  return (
    <section className={`container ${styles.root}`} id="about" aria-labelledby="about-heading">
      <div className={styles.layout}>
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          <span className="text-micro">About</span>
          <RevealText
            as="h2"
            id="about-heading"
            className={styles.heading}
            lines={["About", site.name]}
          />

          <motion.p className={styles.lede} variants={fadeUp(reduced)}>
            {site.intro}
          </motion.p>

          <motion.p className={`text-body ${styles.body}`} variants={fadeUp(reduced)}>
            A spot, an explainer and a reel are the same problem at different
            lengths: hold attention, or lose it. I work the whole chain rather
            than one link — the thumbnail makes a promise the edit has to keep.
          </motion.p>

          <motion.dl className={styles.facts} variants={fadeUp(reduced)}>
            {facts.map((fact) => (
              <div className={styles.fact} key={fact.label}>
                <dt className="text-micro">{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
            <div className={styles.fact}>
              <dt className="text-micro">Tools</dt>
              <dd className={styles.tools}>
                {tools.map((tool) => (
                  <span className="text-small" key={tool}>
                    {tool}
                  </span>
                ))}
              </dd>
            </div>
          </motion.dl>
        </motion.div>

        <div className={styles.portrait} ref={portraitRef}>
          <motion.div className={styles.portraitInner} style={{ y: parallaxY }}>
            {/* The source is landscape; the column wants a portrait frame,
                so the crop is imposed here and object-fit does the rest. */}
            <MediaFrame
              media={sceneMedia.portrait}
              alt={`${site.name}, ${site.role.toLowerCase()}, standing outdoors on a campus walkway`}
              aspect={4 / 5}
              focus="50% 45%"
            />
          </motion.div>
          <div className={styles.portraitCaption}>
            <span className="text-micro">{site.name}</span>
            <span className="text-micro">{site.role}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
