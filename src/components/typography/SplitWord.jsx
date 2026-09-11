import { motion } from 'motion/react';
import { maskRise } from '../../animations/variants';
import { useApp } from '../../hooks/useApp';
import { DUR, STAGGER } from '../../animations/easings';
import './split-word.css';

/**
 * Type set character by character.
 *
 * Words are kept whole (each is an inline-block that cannot break inside)
 * while the spaces between them stay ordinary text — so a phrase still wraps
 * at 390px, but a word never fractures mid-letter.
 *
 * Two nested elements per character, deliberately: the mask's child carries
 * the entrance (Y, owned by Motion) and `.split__inner` carries the scroll
 * choreography (X, owned by GSAP). One transform each — they never fight.
 *
 * The phrase is exposed to assistive tech as ordinary text and the
 * characters are hidden from it. Not `aria-label` on the wrapper: a generic
 * span cannot be named that way, so a heading built only from split type
 * would have no accessible name at all.
 */
export function SplitWord({
  word,
  active = true,
  delay = 0,
  duration = DUR.slow,
  stagger = STAGGER.base,
  className = '',
  ...rest
}) {
  const { reducedMotion } = useApp();
  const words = word.split(' ');
  let index = -1;

  return (
    <span className={`split${className ? ` ${className}` : ''}`} {...rest}>
      <span className="sr-only">{word}</span>
      {words.map((part, partIndex) => (
        <span className="split__word" key={`${part}-${partIndex}`} aria-hidden="true">
          {[...part].map((character, characterIndex) => {
            index += 1;
            const order = index;
            return (
              <span className="mask split__char" key={`${character}-${characterIndex}`}>
                <motion.span
                  variants={maskRise({
                    duration,
                    delay: delay + (reducedMotion ? 0 : order * stagger),
                    reduced: reducedMotion,
                  })}
                  initial="hidden"
                  animate={active ? 'visible' : 'hidden'}
                >
                  <span className="split__inner">{character}</span>
                </motion.span>
              </span>
            );
          })}
          {partIndex < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </span>
  );
}
