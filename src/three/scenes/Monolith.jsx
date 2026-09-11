import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { damp, clamp, mapRange } from '../../animations/easings';
import { pointer } from '../pointer-state';
import { getSceneProgress } from '../../animations/scroll-state';

/**
 * THE MONOLITH — the hero form and the site's signature interaction.
 *
 * A stack of chamfered slabs, widest at its waist. At rest it is a single
 * solid object turning slowly in a hard key light. As the visitor scrolls
 * the stack opens: the slabs part along Y and twist away from the axis,
 * and the camera flies straight through the gap that opens up.
 *
 * The form was chosen because it does three jobs at once — it reads as one
 * sculptural object at a distance, it can open without changing what it is,
 * and it gives the camera something to travel *through* rather than around.
 */

const SLAB_HEIGHT = 0.3;
/* Closed, the seams should read as machined lines, not as a gap. */
const SLAB_GAP = 0.022;
const ACCENT_HEIGHT = 0.1;

export function Monolith({ count = 11, reduced = false, accentIndex = 6 }) {
  const group = useRef(null);
  const slabRefs = useRef([]);
  const state = useRef({ rx: 0, ry: 0 });

  const slabs = useMemo(() => {
    const items = [];
    const half = (count - 1) / 2;
    for (let i = 0; i < count; i += 1) {
      const t = (i - half) / half; // -1 → 1, 0 at the waist
      const taper = 1 - Math.abs(t) ** 1.8 * 0.44;
      // The accent is a seam set into the waist, not a plate laid across it.
      const inset = i === accentIndex ? 0.56 : 1;
      items.push({
        i,
        t,
        width: 2.9 * taper * inset,
        depth: 1.15 * taper * inset,
        y: (i - half) * (SLAB_HEIGHT + SLAB_GAP),
        phase: i * 0.6,
      });
    }
    return items;
  }, [count, accentIndex]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d9d7d1',
        metalness: 0.96,
        roughness: 0.17,
        envMapIntensity: 1.6,
      }),
    [],
  );

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2a1a14',
        metalness: 0.6,
        roughness: 0.32,
        emissive: new THREE.Color('#e2552d'),
        emissiveIntensity: 0.7,
      }),
    [],
  );

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

      // Opening: slabs closest to the camera's path move furthest, so a
      // corridor forms through the middle of the object.
      const spread = open * Math.sign(slab.t || 1) * (0.35 + Math.abs(slab.t) * 2.4);
      mesh.position.y = slab.y + spread + breathe;
      mesh.position.x = open * slab.t * 0.35;
      // At rest every slab shares the group's rotation: one object. The
      // twist only exists while the stack is opening.
      mesh.rotation.y = open * slab.t * 0.85 + heroProgress * slab.t * 0.04;
      mesh.rotation.z = open * slab.t * 0.06;
    }
  });

  return (
    /* Set off-centre: the wordmark stays readable and the form occupies the
       negative space rather than the middle of the composition. */
    <group ref={group} name="monolith" position={[1.05, 0, 0]}>
      {slabs.map((slab) => (
        <RoundedBox
          key={slab.i}
          ref={(node) => {
            slabRefs.current[slab.i] = node;
          }}
          args={[
            slab.width,
            slab.i === accentIndex ? ACCENT_HEIGHT : SLAB_HEIGHT,
            slab.depth,
          ]}
          radius={0.035}
          smoothness={3}
          steps={1}
          position={[0, slab.y, 0]}
          material={slab.i === accentIndex ? accentMaterial : material}
          castShadow={false}
          receiveShadow={false}
        />
      ))}
    </group>
  );
}
