import { useCallback, useEffect, useRef, useState } from 'react';
import { Container, SceneSection } from '../components/layout';
import { Text, MaskLine, Reveal } from '../components/typography';
import { useApp } from '../hooks/useApp';
import { lerp } from '../animations/easings';
import { CAPABILITIES } from '../data/capabilities';
import './capabilities.css';

/**
 * 06 — WHAT I DO
 *
 * A typographic index. Hovering a row shifts it, dims its neighbours, and
 * brings up a preview that rides the pointer a beat behind — the delay is
 * what makes it feel like a physical object being carried rather than a
 * tooltip being positioned.
 *
 * The preview is driven by a single rAF loop writing a transform, never by
 * React state: a pointer move must not reconcile a tree.
 */
export function Capabilities() {
  const ref = useRef(null);
  const previewRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0, cx: 0, cy: 0 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const { device, reducedMotion } = useApp();

  const enabled = device.hasPointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return undefined;

    const state = pointer.current;
    state.cx = window.innerWidth / 2;
    state.cy = window.innerHeight / 2;

    let frame = 0;
    const tick = () => {
      state.cx = lerp(state.cx, state.x, 0.12);
      state.cy = lerp(state.cy, state.y, 0.12);
      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${state.cx}px, ${state.cy}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onMove = (event) => {
      state.x = event.clientX;
      state.y = event.clientY;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [enabled]);

  const onEnter = useCallback((index) => setActiveIndex(index), []);
  const onLeave = useCallback(() => setActiveIndex(-1), []);

  const active = activeIndex >= 0 ? CAPABILITIES[activeIndex] : null;

  return (
    <SceneSection
      id="capabilities"
      scene="capabilities"
      label="Capabilities"
      className="section"
      ref={ref}
    >
      <Container className="layer-front">
        <header className="caps__head">
          <h2 className="t-display">
            <span className="sr-only">What I Do</span>
            <MaskLine as="span" aria-hidden="true">What</MaskLine>
            <MaskLine as="span" delay={0.08} aria-hidden="true">
              I Do
            </MaskLine>
          </h2>
          <Reveal>
            <Text variant="small" tone="dim" style={{ maxWidth: '30ch' }}>
              Seven disciplines, one practice. Most projects use three or four of
              them at once.
            </Text>
          </Reveal>
        </header>

        <ul
          className="caps__list"
          data-hovering={activeIndex >= 0}
          onPointerLeave={onLeave}
        >
          {CAPABILITIES.map((capability, index) => (
            <li className="caps__item" key={capability.id}>
              <Reveal delay={index * 0.04}>
                <a
                  className="caps__row"
                  href="#contact"
                  data-cursor="open"
                  onPointerEnter={() => onEnter(index)}
                  onFocus={() => onEnter(index)}
                  onBlur={onLeave}
                >
                  <Text as="span" variant="index">
                    {capability.index}
                  </Text>
                  <span className="caps__title">{capability.title}</span>
                  <Text as="span" variant="label" className="caps__note">
                    {capability.note}
                  </Text>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>

      {enabled && (
        <div className="caps__preview" ref={previewRef} data-visible={Boolean(active)} aria-hidden="true">
          {CAPABILITIES.map((capability, index) => (
            <img
              key={capability.id}
              src={capability.preview.src}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ display: index === activeIndex ? 'block' : 'none' }}
            />
          ))}
        </div>
      )}
    </SceneSection>
  );
}
