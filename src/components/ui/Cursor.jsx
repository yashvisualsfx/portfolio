import { useEffect, useRef } from 'react';
import { useApp } from '../../hooks/useApp';
import { lerp } from '../../animations/easings';
import './cursor.css';

/**
 * The custom pointer.
 *
 * Two elements at two speeds: a dot that tracks almost exactly, so clicking
 * never feels laggy, and a ring that trails it, which is what reads as
 * weight. Interpolating both would make the site feel unresponsive;
 * interpolating neither would make it feel like a plain cursor.
 *
 * State comes from `data-cursor` on whatever is under the pointer, read on
 * pointerover (which bubbles) rather than by hit-testing every frame.
 *
 * Mounted only where there is a real pointer — never on touch, and never
 * under reduced motion, where a trailing element is exactly the kind of
 * movement being opted out of.
 */

const LABELS = { view: 'View', open: 'Open', drag: 'Drag' };

export function Cursor() {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const { device, reducedMotion } = useApp();

  const enabled = device.hasPointer && !reducedMotion;

  useEffect(() => {
    if (!enabled) return undefined;

    document.documentElement.dataset.pointer = 'custom';

    const state = { x: -100, y: -100, rx: -100, ry: -100, dx: -100, dy: -100 };
    let frame = 0;
    let ready = false;

    const tick = () => {
      state.rx = lerp(state.rx, state.x, 0.14);
      state.ry = lerp(state.ry, state.y, 0.14);
      state.dx = lerp(state.dx, state.x, 0.42);
      state.dy = lerp(state.dy, state.y, 0.42);

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${state.rx}px, ${state.ry}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${state.dx}px, ${state.dy}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onMove = (event) => {
      state.x = event.clientX;
      state.y = event.clientY;
      if (!ready) {
        ready = true;
        // Jump to the pointer on first sight rather than flying in from 0,0.
        state.rx = state.x;
        state.ry = state.y;
        state.dx = state.x;
        state.dy = state.y;
        if (rootRef.current) rootRef.current.dataset.ready = 'true';
      }
    };

    const onOver = (event) => {
      const target = event.target.closest?.('[data-cursor]');
      const next = target?.dataset.cursor ?? 'default';
      if (!rootRef.current || rootRef.current.dataset.state === next) return;
      rootRef.current.dataset.state = next;
      if (labelRef.current) labelRef.current.textContent = LABELS[next] ?? '';
    };

    // `mouseleave` on the root element is the one signal that means the
    // pointer has actually left the window. `pointerout` also fires when the
    // element underneath changes — including during a scroll — which would
    // make the cursor flicker on every section boundary.
    const onLeave = () => {
      if (rootRef.current) rootRef.current.dataset.ready = 'false';
      ready = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      delete document.documentElement.dataset.pointer;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cursor" ref={rootRef} data-state="default" aria-hidden="true">
      <span className="cursor__ring" ref={ringRef}>
        <span className="cursor__label" ref={labelRef} />
      </span>
      <span className="cursor__dot" ref={dotRef} />
    </div>
  );
}
