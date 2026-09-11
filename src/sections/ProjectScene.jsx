import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { Text, MaskLine, Reveal } from '../components/typography';
import { Media } from '../components/ui/Media';
import { ActionLink } from '../components/ui';
import { useApp } from '../hooks/useApp';
import { useScrollChoreography } from '../animations/useScrollChoreography';
import { gsap } from '../animations/gsap-setup';
import { scroll } from '../animations/scroll-state';

/**
 * One project, one frame of the sequence.
 *
 * The media is parallaxed against its own mask as the frame crosses the
 * viewport, and sheared very slightly by scroll velocity — the same read as
 * a whip pan in an edit, which is the language this work is actually in.
 *
 * Hover is desktop-only and is three small moves at once: the image leans
 * toward the pointer, the title shifts, and the cursor changes state.
 */
export function ProjectScene({ project, position, onOpen }) {
  const ref = useRef(null);
  const { reducedMotion, device } = useApp();
  const [hovered, setHovered] = useState(false);
  const inView = useInView(ref, { amount: 0.4 });

  useScrollChoreography(
    ref,
    (_, section) => {
      const frame = section.querySelector('.media__frame');
      if (!frame) return;

      gsap.fromTo(
        frame,
        { yPercent: -9, scale: 1.16 },
        {
          yPercent: 9,
          scale: 1.16,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      );

      // Velocity shear: a per-frame read of the scroll layer, applied with a
      // quickTo so it never allocates a tween.
      const shear = gsap.quickTo(frame, 'skewY', { duration: 0.5, ease: 'power3.out' });
      const ticker = () => shear(scroll.velocity * -1.6);
      gsap.ticker.add(ticker);
      return () => gsap.ticker.remove(ticker);
    },
    { enabled: !reducedMotion, deps: [reducedMotion] },
  );

  const onPointerMove = (event) => {
    if (!device.hasPointer || reducedMotion) return;
    const media = event.currentTarget;
    const rect = media.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    media.style.setProperty('--lean-x', `${x * 14}px`);
    media.style.setProperty('--lean-y', `${y * 14}px`);
  };

  const reset = (event) => {
    event.currentTarget.style.setProperty('--lean-x', '0px');
    event.currentTarget.style.setProperty('--lean-y', '0px');
    setHovered(false);
  };

  return (
    <article
      ref={ref}
      className={`project${position % 2 === 1 ? ' project--flip' : ''}`}
      aria-labelledby={`project-${project.id}-title`}
    >
      <div className="project__grid">
        <div
          className="project__media"
          data-cursor="view"
          onPointerMove={onPointerMove}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={reset}
          style={{ transform: 'translate3d(var(--lean-x, 0), var(--lean-y, 0), 0)' }}
        >
          <Text variant="index" className="project__index">
            {project.index}
          </Text>
          <Media
            cover={project.cover}
            reel={project.reel}
            active={inView && (hovered || !device.hasPointer)}
            sizes="(min-width: 768px) 58vw, 100vw"
          />
        </div>

        <div className="project__body">
          <Reveal>
            <Text variant="label" tone="accent">
              {project.category}
            </Text>
          </Reveal>

          <h3 id={`project-${project.id}-title`} className="t-h2 project__name">
            <MaskLine as="span">{project.title}</MaskLine>
          </h3>

          <Reveal delay={0.08}>
            <Text variant="small" tone="dim">
              {project.summary}
            </Text>
          </Reveal>

          <Reveal delay={0.14} className="project__facts">
            <Text variant="label">{project.year}</Text>
            <Text variant="label">{project.role}</Text>
          </Reveal>

          <Reveal delay={0.2} className="project__open">
            <ActionLink as="button" type="button" onClick={() => onOpen(project.id)}>
              View Project
            </ActionLink>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
