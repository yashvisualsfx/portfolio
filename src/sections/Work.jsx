import { motion } from "motion/react";
import { MediaFrame } from "../components/ui/MediaFrame.jsx";
import { RevealText } from "../components/ui/RevealText.jsx";
import { WorkRail } from "./WorkRail.jsx";
import { fadeUp, stagger, inView } from "../animations/variants.js";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { getMedia } from "../data/media.js";
import { activeCategories } from "../data/projects.js";
import styles from "./Work.module.css";

/*
  Selected Work.

  Each category renders through the layout it declares, because the shapes
  genuinely differ: long-form pieces want the screen to themselves, stills
  want to be read together, and vertical cuts want depth and horizontal
  travel. The orchestrator below just dispatches — the layouts hold the craft.
*/

function CategoryHead({ category }) {
  return (
    <header className={styles.categoryHead}>
      <div>
        <span className={`text-micro ${styles.categoryIndex}`}>
          {category.index} — {category.label}
        </span>
        <RevealText
          as="h2"
          id={`${category.id}-heading`}
          className={styles.categoryHeading}
          lines={category.heading}
        />
      </div>
      <motion.p
        className={`text-body ${styles.categorySummary}`}
        variants={fadeUp(false)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        {category.summary}
      </motion.p>
    </header>
  );
}

/** One piece at a time, framed to its own orientation. */
function CinemaScene({ item, category, priority }) {
  const reduced = usePrefersReducedMotion();
  const resolved = getMedia(item.media);
  const portrait = resolved?.orientation === "portrait";

  return (
    <motion.article
      className={`${styles.scene} ${portrait ? styles.scenePortrait : styles.sceneLandscape}`}
      variants={stagger(0.1)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
    >
      <motion.div className={styles.sceneMedia} variants={fadeUp(reduced, { distance: 40 })}>
        <MediaFrame
          media={item.media}
          alt={item.alt}
          sound
          priority={priority}
          fallbackAspect={category.fallbackAspect}
        />
      </motion.div>

      <motion.div className={styles.sceneMeta} variants={fadeUp(reduced)}>
        <div className={styles.sceneDetail}>
          <span className="text-micro">{item.index}</span>
          <h3 className={styles.sceneTitle}>{item.title}</h3>
          <p className="text-body">{item.description}</p>
        </div>
        <div className={styles.sceneTags}>
          <span className="text-micro">{item.client}</span>
          <span className="text-micro">{item.year}</span>
        </div>
      </motion.div>
    </motion.article>
  );
}

function CinemaCategory({ category, first }) {
  return (
    <section
      className={`container ${styles.category}`}
      id={category.id}
      aria-labelledby={`${category.id}-heading`}
    >
      <CategoryHead category={category} />
      {category.items.map((item, index) => (
        <CinemaScene
          key={item.id}
          item={item}
          category={category}
          // Only the very first piece on the page skips lazy loading.
          priority={first && index === 0}
        />
      ))}
    </section>
  );
}

function GridCategory({ category }) {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      className={`container ${styles.category}`}
      id={category.id}
      aria-labelledby={`${category.id}-heading`}
    >
      <CategoryHead category={category} />
      <motion.div
        className={styles.grid}
        variants={stagger(0.09)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {category.items.map((item) => (
          <motion.article
            className={styles.gridItem}
            key={item.id}
            variants={fadeUp(reduced, { distance: 32 })}
          >
            <MediaFrame
              media={item.media}
              alt={item.alt}
              className={styles.gridMedia}
              fallbackAspect={category.fallbackAspect}
            />
            <div className={styles.gridCaption}>
              <h3 className="text-h3">{item.title}</h3>
              <span className="text-micro">{item.index}</span>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

const LAYOUTS = {
  cinema: CinemaCategory,
  grid: GridCategory,
  rail: WorkRail,
};

export function Work() {
  return (
    <div id="work">
      {activeCategories.map((category, index) => {
        const Layout = LAYOUTS[category.layout] ?? CinemaCategory;
        return <Layout key={category.id} category={category} first={index === 0} />;
      })}
    </div>
  );
}
