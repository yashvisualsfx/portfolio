import { useEffect, useRef, useState } from "react";
import { useIsTouchDevice } from "../../hooks/useIsTouchDevice.js";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import styles from "./Cursor.module.css";

/*
  Custom cursor, desktop only.

  Position is interpolated on its own rAF rather than written in the pointer
  handler — following the mouse exactly just reimplements the system cursor
  with extra latency; the lag is the point.

  State is read from a `data-cursor` attribute on whatever is under the
  pointer, so any element opts in by declaring what it is rather than the
  cursor having to know about every component.
*/
const LABELS = {
  view: "View",
  open: "Open",
  drag: "Drag",
};

export function Cursor() {
  const isTouch = useIsTouchDevice();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef(null);
  const [state, setState] = useState(null);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const enabled = !isTouch && !reduced;

  useEffect(() => {
    if (!enabled) return undefined;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let frame;

    const onMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      setVisible(true);

      // Nearest ancestor that declares a cursor state wins, so a label inside
      // a project card still reports the card's state.
      const node = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      if (node) {
        setState(node.dataset.cursor);
        return;
      }

      const interactive =
        event.target instanceof Element ? event.target.closest("a, button") : null;
      setState(interactive ? "link" : null);
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.16;
      current.y += (target.y - current.y) * 0.16;
      const node = rootRef.current;
      if (node) node.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    frame = requestAnimationFrame(tick);

    // Hide the system cursor only once ours is actually running, so a
    // browser that never fires pointermove is never left without one.
    document.documentElement.style.cursor = "none";

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(frame);
      document.documentElement.style.cursor = "";
    };
  }, [enabled]);

  if (!enabled) return null;

  const label = LABELS[state];
  const className = [
    styles.root,
    label ? styles.active : "",
    state === "link" ? styles.link : "",
    pressed ? styles.pressed : "",
    visible ? "" : styles.hidden,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} ref={rootRef} aria-hidden="true">
      <span className={styles.ring} />
      <span className={styles.dot} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
