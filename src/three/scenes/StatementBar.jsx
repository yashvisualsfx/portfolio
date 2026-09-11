import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { clamp, damp } from '../../animations/easings';
import { getSceneProgress } from '../../animations/scroll-state';
import { pointer } from '../pointer-state';
import { createSlabMaterial, createAccentMaterial } from './slabs';
import { SCENE_Z, sectionPresence } from '../camera-path';

/**
 * 09 — THE STATEMENT
 *
 * A single slab from the monolith, blown up and laid across the frame. The
 * words of the statement sit on both sides of it, so the letters genuinely
 * pass behind and in front of a physical object rather than being layered
 * over a picture of one.
 *
 * Using the monolith's own slab rather than a new form is the point: by this
 * stage in the journey the shape should already be familiar.
 */
export function StatementBar({ reduced = false }) {
  const group = useRef(null);
  /**
   * Brushed rather than polished. A near-pure metal has no diffuse response,
   * so a large flat face in a dark studio returns almost nothing — correct
   * physics, unreadable image. Dropping metalness lets the key light land on
   * it, and at this scale that is the difference between a machined bar and
   * a black rectangle.
   */
  const material = useMemo(() => {
    const created = createSlabMaterial({ fadeable: true });
    created.metalness = 0.52;
    created.roughness = 0.34;
    created.color.set('#cbc9c3');
    return created;
  }, []);
  const accent = useMemo(() => createAccentMaterial({ fadeable: true }), []);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    const presence = sectionPresence('statement', { lead: 0.02, tail: 0.015 });
    group.current.visible = presence > 0.01;
    if (!group.current.visible) return;

    const dt = Math.min(delta, 0.1);
    const progress = clamp(getSceneProgress('statement'));
    const time = reduced ? 0 : clock.elapsedTime;

    material.opacity = presence;
    accent.opacity = presence;

    // A slow tilt through the section, so the bar is never a flat rectangle.
    group.current.rotation.z = damp(
      group.current.rotation.z,
      -0.07 + progress * 0.14 + (reduced ? 0 : pointer.sy * 0.02),
      0.002,
      dt,
    );
    group.current.rotation.y = damp(
      group.current.rotation.y,
      0.55 - progress * 0.75 + (reduced ? 0 : pointer.sx * 0.05),
      0.002,
      dt,
    );
    // Tilted down toward the camera so the top face catches the key light:
    // face-on, a polished slab returns only the dark half of the environment.
    group.current.rotation.x = damp(group.current.rotation.x, -0.3, 0.002, dt);
    group.current.position.y = damp(group.current.position.y, Math.sin(time * 0.4) * 0.06, 0.004, dt);
  });

  return (
    <group ref={group} name="statement-bar" position={[0, 0, SCENE_Z.statement]}>
      <RoundedBox args={[7.6, 1.45, 2.1]} radius={0.06} smoothness={3} steps={1} material={material} />
      <RoundedBox
        args={[7.8, 0.1, 1.3]}
        radius={0.04}
        smoothness={3}
        steps={1}
        position={[0, -0.82, 0]}
        material={accent}
      />
    </group>
  );
}
