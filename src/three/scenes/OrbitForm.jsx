import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, damp } from '../../animations/easings';
import { getSceneProgress } from '../../animations/scroll-state';
import { SCENE_Z, sectionPresence } from '../camera-path';

/**
 * 07 — THE PAUSE
 *
 * A faceted mass with a single machined ring around it. Deliberately the
 * opposite of the monolith: where that object is orthogonal and stacked,
 * this one is crystalline and whole — the visitor should register that they
 * have arrived somewhere else, not that the same prop came back.
 *
 * Flat shading is the point. Every facet returns one clean value from the
 * key light, so the form is legible as geometry rather than as a blur.
 */
export function OrbitForm({ detail = 1, reduced = false }) {
  const group = useRef(null);
  const ring = useRef(null);
  const shell = useRef(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.1, detail);
    // Push each vertex out along its own normal by a fixed hash so the mass
    // reads as cut rather than as a sphere approximation.
    const position = geo.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const noise = Math.sin(x * 1.7) * Math.cos(y * 1.3) * Math.sin(z * 1.1);
      const scale = 1 + noise * 0.14;
      position.setXYZ(i, x * scale, y * scale, z * scale);
    }
    geo.computeVertexNormals();
    return geo;
  }, [detail]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    // Presence, not a switch: the form fades up as the interlude begins and
    // away as it ends, so it never competes with the sections on either side.
    const presence = sectionPresence('orbit', { lead: 0.025, tail: 0.025 });

    group.current.visible = presence > 0.01;
    if (!group.current.visible) return;

    const dt = Math.min(delta, 0.1);

    if (shell.current) shell.current.opacity = presence;
    if (ring.current) ring.current.material.opacity = presence;
    const progress = clamp(getSceneProgress('orbit'));
    const time = reduced ? 0 : clock.elapsedTime;

    // The form turns against the camera's sweep, so the orbit reads as
    // twice the travel it actually is.
    group.current.rotation.y = damp(group.current.rotation.y, -progress * 1.1 + time * 0.05, 0.002, dt);
    group.current.rotation.x = damp(group.current.rotation.x, progress * 0.3, 0.002, dt);

    if (ring.current) {
      ring.current.rotation.z = time * 0.12 + progress * 0.8;
      ring.current.rotation.x = Math.PI / 2.6;
    }
  });

  return (
    <group ref={group} name="orbit-form" position={[0, 0, SCENE_Z.orbit]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={shell}
          color="#8d8b86"
          metalness={0.9}
          roughness={0.29}
          envMapIntensity={1.1}
          transparent
          opacity={0}
          flatShading
        />
      </mesh>

      <mesh ref={ring}>
        <torusGeometry args={[3.1, 0.022, 8, 128]} />
        <meshStandardMaterial
          color="#e2552d"
          emissive="#e2552d"
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}
