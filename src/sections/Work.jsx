import { useRef } from 'react';
import { Container, SceneSection } from '../components/layout';
import { Text, MaskLine, Reveal } from '../components/typography';
import { ProjectScene } from './ProjectScene';
import { PROJECTS } from '../data/projects';
import './work.css';

/**
 * 04 — SELECTED WORK
 *
 * Six projects, each holding the frame for its own scroll. No grid: the
 * composition alternates side to side, so descending the section reads as a
 * sequence of cuts rather than as a list of cards.
 */
export function Work({ onOpenProject }) {
  const ref = useRef(null);

  return (
    <SceneSection id="work" scene="work" label="Selected work" className="work" ref={ref}>
      <Container>
        <header className="work__head">
          <h2 className="t-display work__title">
            <MaskLine as="span">Selected</MaskLine>
            <MaskLine as="span" delay={0.08}>
              Work
            </MaskLine>
          </h2>
          <Reveal className="work__meta">
            <Text variant="label">
              {String(PROJECTS.length).padStart(2, '0')} Projects
            </Text>
            <Text variant="small" tone="dim">
              Campaigns, motion systems and real-time experiments — selected from
              five years of commissioned and self-initiated work.
            </Text>
            <Text variant="label">2024 — 2026</Text>
          </Reveal>
        </header>

        {PROJECTS.map((project, index) => (
          <ProjectScene
            key={project.id}
            project={project}
            position={index}
            onOpen={onOpenProject}
          />
        ))}
      </Container>
    </SceneSection>
  );
}
