import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { damp, clamp, mapRange } from '../../animations/easings';
import { pointer } from '../pointer-state';
import { getSceneProgress } from '../../animations/scroll-state';
import { buildSlabs, createSlabMaterial, createAccentMaterial } from './slabs';

/**
 * THE MONOLITH — the hero form and the site's signature interaction.
 *
 * At rest it is a single solid object turning slowly in a hard key light.
 * As the visitor scrolls the stack opens: the slabs part along Y and twist
 * away from the axis, and the camera flies straight through the corridor
 * that opens up.
 *
 * The form earns its place by doing three jobs at once — it reads as one
 * sculptural object at a distance, it can open without stopping being
 * itself, and it gives the camera something to travel *through* rather than
 * merely around.
 */
export function Monolith({ count = 11, reduced = false, accentIndex = 6 }) {
  const group = useRef(null);
  const slabRefs = useRef([]);
  const state = useRef({ rx: 0, ry: 0 });

  const slabs = useMemo(() => buildSlabs(count, accentIndex), [count, accentIndex]);
  const material = useMemo(() => createSlabMaterial(), []);
  const accentMaterial = useMemo(() => createAccentMaterial(), []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1);
    if (!group.current) return;

    // `open` is the transformation section's progress: 0 closed, 1 fully
    // parted. The hero's own progress adds a little lift before it starts.
    const open = clamp(getSceneProgress('transform'));
    const heroProgress = clamp(getSceneProgress('hero'));
    const time = reduced ? 0 : clock.elapsedTime;

    const targetRy = time * 0.12 + open * 1.5 + (reduced ? 0 : pointer.sx * 0.22);
    const targetRx = (reduced ? 0 : pointer.sy * -0.14) + open * 0.12;

    state.current.ry = damp(state.current.ry, targetRy, 0.002, dt);
    state.current.rx = damp(state.current.rx, targetRx, 0.002, dt);

    group.current.rotation.y = state.current.ry;
    group.current.rotation.x = state.current.rx;

    // Once the camera is through it, the stack drifts away rather than
    // popping. Driven by the transformation's own progress, so it is
    // unaffected by how long the rest of the page happens to be.
    const past = mapRange(open, 0.8, 1, 0, 1);
    group.current.position.z = -past * 10;
    group.current.visible = past < 0.999;

    for (let i = 0; i < slabs.length; i += 1) {
      const slab = slabs[i];
      const mesh = slabRefs.current[i];
      if (!mesh) continue;

      // Idle: a slow, uneven breath so the stack never reads as a rigid prop.
      const breathe = reduced ? 0 : Math.sin(time * 0.7 + slab.phase) * 0.012;

      // Opening: the slabs furthest from the waist move furthest, so a
      // corridor forms through the middle of the object.
      const spread = open * Math.sign(slab.t || 1) * (0.35 + Math.abs(slab.t) * 2.4);
      mesh.position.y = slab.y + spread + breathe;
      mesh.position.x = open * slab.t * 0.35;
      // At rest every slab shares the group's rotation: one object. The
      // twist exists only while the stack is opening.
      mesh.rotation.y = open * slab.t * 0.85 + heroProgress * slab.t * 0.04;
      mesh.rotation.z = open * slab.t * 0.06;
    }
  });

  return (
    /* Set off-centre and low: the wordmark runs across the upper half, so the
       form sits in the space the type leaves rather than underneath it. */
    <group ref={group} name="monolith" position={[1.75, -0.35, 0]}>
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
