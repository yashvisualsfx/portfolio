import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MediaFrame } from "../components/ui/MediaFrame.jsx";
import { RevealText } from "../components/ui/RevealText.jsx";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import styles from "./Work.module.css";

/*
  Vertical scrolling drives horizontal travel.

  ScrollTrigger pins the section and converts the scroll distance into
  sideways movement on the track. Panels sit on a real perspective plane, so
  the one nearest the centre comes forward and sharpens while the others fall
  back in Z — genuine depth rather than a scale trick.

  Two cases turn the effect off rather than degrading it:

  - The track already fits the viewport (few panels, or a wide screen). There
    is nothing to travel, and pinning anyway would hold the page still for a
    screen's worth of scroll while nothing moved. It becomes a centred row.
  - Reduced motion. An ordinary swipeable scroller: same content, same order,
    driven by the user's own gesture.
*/
export function WorkRail({ category }) {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const panelsRef = useRef([]);
  const [travels, setTravels] = useState(true);

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return undefined;

    const overflow = () => Math.max(0, track.scrollWidth - window.innerWidth);

    if (overflow() <= 0) {
      setTravels(false);
      return undefined;
    }
    setTravels(true);

    const context = gsap.context(() => {
      // Travel is the track's overrun past the viewport, so the last panel
      // lands flush at the right edge rather than over- or under-shooting.
      gsap.to(track, {
        x: () => -overflow(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${overflow() + window.innerHeight}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // A viewport that grows past the track width mid-session has
          // nothing left to travel; drop back to the static row.
          onRefresh: () => setTravels(overflow() > 0),
        },
      });

      // Depth per panel, computed from its live position so it responds to
      // actual distance from centre rather than to its index.
      const panels = panelsRef.current.filter(Boolean);
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${overflow() + window.innerHeight}`,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: () => {
          const centre = window.innerWidth / 2;
          panels.forEach((panel) => {
            const box = panel.getBoundingClientRect();
            const offset = (box.left + box.width / 2 - centre) / centre;
            const away = Math.min(Math.abs(offset), 1.4);

            gsap.set(panel, {
              z: -away * 340,
              rotateY: offset * -14,
              opacity: 1 - away * 0.45,
            });
          });
        },
      });
    }, section);

    return () => context.revert();
  }, [reduced, category.items.length]);

  const isStatic = reduced || !travels;

  return (
    <section
      className={`${styles.rail} ${isStatic ? styles.railStatic : ""}`}
      id={category.id}
      ref={sectionRef}
      aria-labelledby={`${category.id}-heading`}
    >
      <div className={styles.railViewport}>
        <div className={`container ${styles.railHead}`}>
          <span className="text-micro">
            {category.index} — {category.label}
          </span>
          <RevealText
            as="h2"
            id={`${category.id}-heading`}
            className={styles.categoryHeading}
            lines={category.heading}
          />
        </div>

        <div
          className={styles.railTrack}
          ref={trackRef}
          style={reduced ? { overflowX: "auto" } : undefined}
        >
          {category.items.map((item, index) => (
            <article
              className={styles.railPanel}
              key={item.id}
              ref={(node) => {
                panelsRef.current[index] = node;
              }}
            >
              <MediaFrame
                media={item.media}
                alt={item.alt}
                sound
                fallbackAspect={category.fallbackAspect}
              />
              <div className={styles.railCaption}>
                <span className="text-micro">{item.index}</span>
                <h3 className="text-h3">{item.title}</h3>
                <p className="text-small">{item.client}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
