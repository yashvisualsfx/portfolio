import { useEffect, useRef } from 'react';
import { useApp } from '../../hooks/useApp';
import { scroll } from '../../animations/scroll-state';
import './marquee.css';

/**
 * An infinite statement.
 *
 * Two identical tracks translated by a single rAF loop; when the first has
 * travelled its own width the offset wraps, so there is no keyframe to
 * restart and no seam to see.
 *
 * Scroll velocity is added to the base speed — the line speeds up and can
 * reverse as the visitor scrolls, which ties a decorative element to
 * something the visitor is actually doing. Under reduced motion it holds
 * still.
 */
export function Marquee({ words, speed = 46 }) {
  const trackRefs = useRef([]);
  const { reducedMotion } = useApp();

  useEffect(() => {
    if (reducedMotion) return undefined;

    let frame = 0;
    let offset = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const width = trackRefs.current[0]?.offsetWidth ?? 0;
      if (width > 0) {
        offset -= (speed + scroll.velocity * 900) * dt;
        // Wrap in both directions: velocity can push the line backwards.
        offset = ((offset % width) + width) % width;
        const transform = `translate3d(${-offset}px, 0, 0)`;
        for (const track of trackRefs.current) {
          if (track) track.style.transform = transform;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed, reducedMotion]);

  const content = (key) => (
    <div
      className="marquee__track"
      key={key}
      ref={(node) => {
        trackRefs.current[key] = node;
      }}
      aria-hidden={key > 0}
    >
      {words.map((word) => (
        <span className="marquee__item" key={`${key}-${word}`}>
          {word}
          <span className="marquee__sep" aria-hidden="true">
            {' × '}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    /* No live-region role: the words never change, they only move. The first
       track is readable text and the duplicate is hidden from the tree. */
    <div className="marquee">
      {content(0)}
      {content(1)}
    </div>
  );
}
