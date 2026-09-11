/**
 * A section that owns a stretch of the camera journey.
 *
 * `scene` must match a key in three/camera-path.js — that is the contract
 * between the DOM and the 3D world. `hold` adds pure scroll distance for
 * sections whose choreography needs more room than their content does.
 */
export function SceneSection({
  ref,
  id,
  scene,
  label,
  hold,
  className = '',
  style,
  children,
  ...rest
}) {
  const inline = hold ? { ...style, minHeight: `${hold}dvh` } : style;

  return (
    <section
      ref={ref}
      id={id}
      data-scene={scene}
      aria-label={label}
      className={className}
      style={inline}
      {...rest}
    >
      {children}
    </section>
  );
}
