import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { clamp, damp, mapRange } from '../../animations/easings';
import { getSceneProgress } from '../../animations/scroll-state';
import { pointer } from '../pointer-state';
import { buildSlabs, createSlabMaterial, createAccentMaterial } from './slabs';
import { SCENE_Z } from '../camera-path';

/**
 * 10 — THE SETTLE
 *
 * The stack re-forms. It arrives scattered and closes as the contact section
 * comes to rest, which is the journey's answer to the hero: the same object,
 * put back together at the end of the corridor.
 *
 * `pressure` lets the CTA reach into the scene — hovering it pulls the stack
 * a little tighter, so the last interaction in the site is also the last
 * thing the 3D layer responds to.
 */
export function Finale({ count = 9, reduced = false, pressure = 0 }) {
  const group = useRef(null);
  const slabRefs = useRef([]);
  const accentIndex = Math.floor(count / 2);

  const slabs = useMemo(() => buildSlabs(count, accentIndex), [count, accentIndex]);
  const material = useMemo(() => createSlabMaterial({ fadeable: true }), []);
  const accentMaterial = useMemo(() => createAccentMaterial({ fadeable: true }), []);
  const smoothed = useRef(0);

  useFrame(({ clock, camera }, delta) => {
    if (!group.current) return;

    const distance = camera.position.z - SCENE_Z.finale;
    const presence =
      clamp(mapRange(distance, 4, 9, 0, 1)) * clamp(mapRange(distance, 21, 15, 0, 1));
    group.current.visible = presence > 0.01;
    if (!group.current.visible) return;

    const dt = Math.min(delta, 0.1);
    const settle = clamp(getSceneProgress('finale'));
    const time = reduced ? 0 : clock.elapsedTime;

    material.opacity = presence;
    accentMaterial.opacity = presence;

    smoothed.current = damp(smoothed.current, pressure, 0.002, dt);
    // 1 → fully scattered, 0 → re-formed. Hovering the CTA closes the last
    // of the gap.
    const scatter = (1 - settle) * (1 - smoothed.current * 0.45);

    group.current.rotation.y = damp(
      group.current.rotation.y,
      -0.5 + settle * 0.5 + time * 0.04 + (reduced ? 0 : pointer.sx * 0.14),
      0.002,
      dt,
    );
    group.current.rotation.x = damp(
      group.current.rotation.x,
      0.1 - settle * 0.1 + (reduced ? 0 : pointer.sy * -0.08),
      0.002,
      dt,
    );

    for (let i = 0; i < slabs.length; i += 1) {
      const slab = slabs[i];
      const mesh = slabRefs.current[i];
      if (!mesh) continue;

      const breathe = reduced ? 0 : Math.sin(time * 0.6 + slab.phase) * 0.008 * (1 - settle);
      mesh.position.y = slab.y + scatter * slab.t * 1.9 + breathe;
      mesh.position.x = scatter * Math.sin(slab.phase) * 0.9;
      mesh.rotation.y = scatter * slab.t * 0.9;
      mesh.rotation.z = scatter * Math.cos(slab.phase) * 0.12;
    }
  });

  return (
    /* Held right of centre: the statement is left-aligned, so the form takes
       the space the type leaves rather than sitting behind it. */
    <group ref={group} name="finale" position={[1.7, -0.3, SCENE_Z.finale]} scale={0.82}>
      {slabs.map((slab) => (
        <RoundedBox
          key={slab.i}
          ref={(node) => {
            slabRefs.current[slab.i] = node;
          }}
          args={[slab.width, slab.height, slab.depth]}
          radius={0.035}
          smoothness={3}
          steps={1}
          position={[0, slab.y, 0]}
          material={slab.i === accentIndex ? accentMaterial : material}
        />
      ))}
    </group>
  );
}
