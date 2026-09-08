import { motion } from "motion/react";
import { maskLine, stagger, inView } from "../../animations/variants.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import styles from "./RevealText.module.css";

/**
 * Oversized editorial type that rises out of a mask, line by line.
 *
 * The whole site's headings go through this component so the reveal reads
 * identically everywhere and the mask/stagger logic lives in exactly one place.
 *
 * @param {string[]} lines   one entry per visual line — line breaks are art
 *                           direction here, not a consequence of wrapping
 * @param {boolean}  [animate] drive externally (the hero's intro sequence);
 *                           omit to reveal when scrolled into view
 */
export function RevealText({
  lines,
  as: Tag = "span",
  className,
  lineClassName,
  delay = 0,
  lineStagger = 0.09,
  animate,
  ...rest
}) {
  const reduced = usePrefersReducedMotion();
  // `motion[tag]` is cached by the library — building the component inside
  // render (via motion.create) would remount the heading on every pass.
  const MotionTag = motion[Tag] ?? motion.span;

  // Controlled by a parent sequence, or self-triggered on scroll.
  const trigger =
    animate === undefined
      ? { initial: "hidden", whileInView: "visible", viewport: inView }
      : { initial: "hidden", animate: animate ? "visible" : "hidden" };

  return (
    <MotionTag
      className={className}
      variants={stagger(lineStagger, delay)}
      {...trigger}
      {...rest}
    >
      {lines.map((line, index) => (
        <span className={`${styles.line} ${lineClassName ?? ""}`} key={`${line}-${index}`}>
          <motion.span className={styles.inner} variants={maskLine(reduced)}>
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
