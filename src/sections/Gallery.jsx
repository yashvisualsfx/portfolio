import { useRef, useState } from 'react';
import { Container, SceneSection } from '../components/layout';
import { Text, MaskLine } from '../components/typography';
import { useApp } from '../hooks/useApp';
import { useScrollChoreography } from '../animations/useScrollChoreography';
import { gsap } from '../animations/gsap-setup';
import { GALLERY_PROJECTS } from '../data/projects';
import './gallery.css';

/**
 * 05 — HORIZONTAL GALLERY (the reading)
 *
 * The panels themselves live in the WebGL stage; this section supplies the
 * scroll distance that drives them and the type that names what is in front
 * of you. React is told about the change of project — once per project, not
 * once per frame.
 */
export function Gallery() {
  const ref = useRef(null);
  const { reducedMotion } = useApp();
  const [active, setActive] = useState(0);

  useScrollChoreography(
    ref,
    (_, section) => {
      const last = GALLERY_PROJECTS.length - 1;
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => {
            const index = Math.round(self.progress * last);
            setActive((current) => (current === index ? current : index));
          },
        },
      });
    },
    { deps: [] },
  );

  const project = GALLERY_PROJECTS[active];

  return (
    <SceneSection
      id="gallery"
      scene="gallery"
      label="Project gallery"
      className="gallery"
      hold={320}
      ref={ref}
    >
      <Container className="gallery__sticky layer-front">
        <div className="gallery__head">
          <Text variant="label" tone="accent">
            05 — Gallery
          </Text>
          <Text variant="label">Scroll to travel</Text>
        </div>

        <div className="gallery__active">
          <Text variant="label">
            Project {project.index}
          </Text>
          {/* Keyed so each change re-runs the mask reveal rather than
              cross-fading text in place. */}
          <h2 className="t-h2" key={project.id}>
            <MaskLine as="span" trigger={reducedMotion ? 'mount' : 'mount'}>
              {project.title}
            </MaskLine>
          </h2>
          <Text variant="small" tone="dim">
            {project.summary}
          </Text>
        </div>

        <div className="gallery__rail">
          <div className="gallery__ticks" aria-hidden="true">
            {GALLERY_PROJECTS.map((item, index) => (
              <span
                key={item.id}
                className="gallery__tick"
                data-active={index <= active}
              />
            ))}
          </div>
          <div className="gallery__labels">
            <Text variant="label">{project.category}</Text>
            <Text variant="label">
              {project.index} / {String(GALLERY_PROJECTS.length).padStart(2, '0')}
            </Text>
          </div>
        </div>
      </Container>
    </SceneSection>
  );
}
