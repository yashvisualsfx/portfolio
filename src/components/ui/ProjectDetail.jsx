import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Container } from '../layout';
import { Text, MaskLine, Reveal } from '../typography';
import { Media } from './Media';
import { ActionLink } from './ActionLink';
import { useApp } from '../../hooks/useApp';
import { useScrollLock } from '../../hooks/useScrollLock';
import { DUR, EASE } from '../../animations/easings';
import { PROJECTS, getProjectById } from '../../data/projects';
import './project-detail.css';

/**
 * The project view.
 *
 * A dialog rather than a route: the visitor is mid-journey and the page
 * behind them should still be where they left it. It arrives as a cut —
 * a clip-path wipe from the bottom — and leaves the same way.
 *
 * Focus moves in and is trapped; Escape closes; the page beneath is locked.
 */
export function ProjectDetail({ projectId, onClose, onNavigate }) {
  const { reducedMotion } = useApp();
  const panelRef = useRef(null);
  const project = projectId ? getProjectById(projectId) : null;

  useScrollLock(Boolean(project));

  useEffect(() => {
    if (!project) return undefined;

    const panel = panelRef.current;
    const focusables = () => panel?.querySelectorAll('a[href], button:not([disabled])') ?? [];
    focusables()[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [...focusables()];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  const index = project ? PROJECTS.findIndex((item) => item.id === project.id) : -1;
  const next = index >= 0 ? PROJECTS[(index + 1) % PROJECTS.length] : null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="detail"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-title"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          transition={{ duration: reducedMotion ? DUR.fast : 0.85, ease: EASE.signature }}
        >
          <Container className="detail__bar">
            <Text variant="label" tone="accent">
              {project.index} — {project.category}
            </Text>
            <button type="button" className="detail__close" onClick={onClose} data-cursor="open">
              <Text as="span" variant="label" tone="ink">
                Close
              </Text>
              <span className="detail__close-mark" aria-hidden="true" />
            </button>
          </Container>

          <Container>
            <div className="detail__hero">
              <Media
                cover={project.cover}
                reel={project.reel}
                active
                eager
                sizes="(min-width: 768px) 92vw, 100vw"
              />
            </div>

            <h2 id="detail-title" className="t-display detail__title">
              <MaskLine as="span" trigger="mount">
                {project.title}
              </MaskLine>
            </h2>

            <div className="detail__body">
              <div>
                <Reveal>
                  <Text variant="lead" style={{ maxWidth: '38ch' }}>
                    {project.summary}
                  </Text>
                </Reveal>
                <Reveal delay={0.08}>
                  <Text variant="body" style={{ marginTop: 'var(--sp-md)' }}>
                    {project.description}
                  </Text>
                </Reveal>
              </div>

              <dl className="detail__facts">
                {[
                  ['Client', project.client],
                  ['Role', project.role],
                  ['Year', project.year],
                  ['Tools', project.tools.join(', ')],
                ].map(([label, value]) => (
                  <div className="detail__fact" key={label}>
                    <Text as="dt" variant="label">
                      {label}
                    </Text>
                    <Text as="dd" variant="small" style={{ textAlign: 'right' }}>
                      {value}
                    </Text>
                  </div>
                ))}
              </dl>
            </div>

            <div className="detail__foot">
              <Text variant="label">Next project</Text>
              {next && (
                <ActionLink
                  as="button"
                  type="button"
                  size="display"
                  onClick={() => onNavigate(next.id)}
                >
                  {next.title}
                </ActionLink>
              )}
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
