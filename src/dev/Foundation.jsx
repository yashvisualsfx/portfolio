import { motion } from 'motion/react';
import { Section, Grid, Col } from '../components/layout';
import { Text, MaskLine, Reveal } from '../components/typography';
import { staggerParent, drawRule, inViewProps, IN_VIEW_EARLY } from '../animations/variants';
import { CSS_EASE, STAGGER } from '../animations/easings';
import { useApp } from '../hooks/useApp';
import { SITE } from '../data/site';
import { PROJECTS } from '../data/projects';
import { CAPABILITIES } from '../data/capabilities';
import './foundation.css';

/**
 * PHASE 2 SPECIMEN — the foundation, rendered.
 *
 * This page exists to prove the design system runs and holds up at 390 /
 * 768 / 1440 before any 3D is layered on top. Phase 3 replaces it with the
 * real preloader, navigation and hero; nothing else imports from /dev.
 */

const TYPE_SCALE = [
  { variant: 'display', label: 'display — section headings' },
  { variant: 'h1', label: 'h1 — statements' },
  { variant: 'h2', label: 'h2 — project titles' },
  { variant: 'h3', label: 'h3 — subheads' },
  { variant: 'lead', label: 'lead — supporting copy' },
  { variant: 'body', label: 'body — paragraphs' },
  { variant: 'small', label: 'small — captions' },
  { variant: 'label', label: 'label — interface meta' },
];

const SWATCHES = [
  { token: '--c-bg', name: 'Ground' },
  { token: '--c-bg-raise', name: 'Raised' },
  { token: '--c-ink', name: 'Ink' },
  { token: '--c-ink-dim', name: 'Ink dim' },
  { token: '--c-ink-faint', name: 'Ink faint' },
  { token: '--c-accent', name: 'Accent' },
];

function SectionHead({ index, title, note }) {
  return (
    <div className="section-head">
      <Text as="h2" variant="label" tone="accent">
        {index} — {title}
      </Text>
      {note ? (
        <Text variant="label" tone="faint">
          {note}
        </Text>
      ) : null}
    </div>
  );
}

export default function Foundation() {
  const { device, reducedMotion } = useApp();

  return (
    <>
      {/* ---------------------------------------------- Wordmark & scale */}
      <Section id="top" label="Foundation" className="spec-hero">
        <motion.div
          variants={staggerParent({ stagger: STAGGER.loose, reduced: reducedMotion })}
          initial="hidden"
          animate="visible"
        >
          <Text as="h1" variant="mega" className="spec-hero__word">
            <MaskLine as="span" trigger="parent">
              {SITE.name}
            </MaskLine>
          </Text>

          <div className="spec-hero__meta">
            <Reveal trigger="parent">
              <Text variant="label" tone="ink">
                {SITE.role}
              </Text>
            </Reveal>
            <Reveal trigger="parent">
              <Text variant="lead" tone="dim">
                {SITE.tagline}
              </Text>
            </Reveal>
            <Reveal trigger="parent">
              <Text variant="label">
                {SITE.location} / {SITE.year}
              </Text>
            </Reveal>
          </div>
        </motion.div>
      </Section>

      {/* --------------------------------------------------- Type scale */}
      <Section label="Type scale" size="tight">
        <SectionHead index="01" title="Type scale" note="fluid 390 → 1440" />
        <div className="stack">
          {TYPE_SCALE.map(({ variant, label }) => (
            <div className="spec-row" key={variant}>
              <Text variant={variant}>Make it memorable</Text>
              <Text variant="label">{label}</Text>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ Palette */}
      <Section label="Palette" size="tight">
        <SectionHead index="02" title="Palette" note="one accent, rationed" />
        <div className="spec-swatches">
          {SWATCHES.map(({ token, name }) => (
            <div key={token}>
              <div className="spec-swatch__chip" style={{ background: `var(${token})` }} />
              <Text variant="label" tone="ink">
                {name}
              </Text>
              <Text variant="small" tone="faint">
                {token}
              </Text>
            </div>
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------- Grid */}
      <Section label="Grid" size="tight">
        <SectionHead index="03" title="Grid" note="6 col → 12 col @ 768" />
        <Grid className="spec-grid-demo">
          {Array.from({ length: 12 }, (_, i) => (
            <Col key={i} span={1} spanSm={1}>
              <Text variant="label" tone="faint">
                {String(i + 1).padStart(2, '0')}
              </Text>
            </Col>
          ))}
        </Grid>

        <Grid className="spec-grid-demo" style={{ marginTop: 'var(--sp-md)' }}>
          <Col span={7} spanSm={6}>
            <Text variant="label" tone="faint">
              7 / 6
            </Text>
          </Col>
          <Col span={5} spanSm={6}>
            <Text variant="label" tone="faint">
              5 / 6
            </Text>
          </Col>
        </Grid>
      </Section>

      {/* ----------------------------------------------- Reveal system */}
      <Section label="Motion" size="tight">
        <SectionHead index="04" title="Motion" note={CSS_EASE.signature} />
        <Text as="p" variant="display">
          <MaskLine as="span">Selected</MaskLine>
          <MaskLine as="span" delay={0.08} tone="dim">
            Work
          </MaskLine>
        </Text>
        <motion.hr
          className="rule"
          style={{ marginTop: 'var(--sp-lg)', transformOrigin: 'left' }}
          variants={drawRule({ reduced: reducedMotion })}
          {...inViewProps(reducedMotion, IN_VIEW_EARLY)}
        />
      </Section>

      {/* ---------------------------------------------------- Data check */}
      <Section label="Work index" size="tight">
        <SectionHead index="05" title="Work index" note={`${PROJECTS.length} projects`} />
        <ul>
          {PROJECTS.map((project) => (
            <li className="spec-project" key={project.id}>
              <Text variant="index">{project.index}</Text>
              <div>
                <Text as="h3" variant="h2" className="spec-project__title">
                  {project.title}
                </Text>
                <Text variant="small" tone="dim" style={{ marginTop: 'var(--sp-2xs)' }}>
                  {project.summary}
                </Text>
              </div>
              <Text variant="label">{project.category}</Text>
            </li>
          ))}
        </ul>
      </Section>

      <Section label="Capability index" size="tight">
        <SectionHead index="06" title="Capabilities" note={`${CAPABILITIES.length} disciplines`} />
        <ul>
          {CAPABILITIES.map((capability) => (
            <li className="spec-row" key={capability.id}>
              <Text variant="h3">
                <span className="t-index">{capability.index}</span>&nbsp;&nbsp;{capability.title}
              </Text>
              <Text variant="label">{capability.note}</Text>
            </li>
          ))}
        </ul>
      </Section>

      {/* --------------------------------------------------- Environment */}
      <Section label="Environment" size="tight">
        <SectionHead index="07" title="Environment" note="live device profile" />
        <Grid>
          <Col span={6} spanSm={6}>
            <div className="spec-stat">
              <Text variant="label">Breakpoint</Text>
              <Text variant="small">{device.breakpoint}</Text>
            </div>
            <div className="spec-stat">
              <Text variant="label">Fine pointer</Text>
              <Text variant="small">{String(device.hasPointer)}</Text>
            </div>
            <div className="spec-stat">
              <Text variant="label">Reduced motion</Text>
              <Text variant="small">{String(reducedMotion)}</Text>
            </div>
          </Col>
          <Col span={6} spanSm={6}>
            <div className="spec-stat">
              <Text variant="label">Render tier</Text>
              <Text variant="small">{device.tier}</Text>
            </div>
            <div className="spec-stat">
              <Text variant="label">DPR cap</Text>
              <Text variant="small">{device.dpr.join(' → ')}</Text>
            </div>
            <div className="spec-stat">
              <Text variant="label">Phase</Text>
              <Text variant="small">02 — foundation</Text>
            </div>
          </Col>
        </Grid>
      </Section>
    </>
  );
}
