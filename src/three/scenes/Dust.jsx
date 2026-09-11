import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_Z } from '../camera-path';

/**
 * The corridor itself.
 *
 * A single points field spanning the whole journey in Z. It exists for one
 * reason: without something at intermediate depths, travelling through an
 * empty black volume reads as nothing moving at all. One draw call buys the
 * parallax that makes the camera's travel legible.
 */
export function Dust({ count = 700, reduced = false }) {
  const points = useRef(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const depth = Math.abs(SCENE_Z.finale) + 20;

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = 10 - Math.random() * depth;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current || reduced) return;
    // A slow drift, not a starfield: the motion should be barely noticed.
    points.current.rotation.y = clock.elapsedTime * 0.008;
  });

  return (
    <points ref={points} geometry={geometry} name="dust">
      <pointsMaterial
        size={0.028}
        color="#f2efe9"
        transparent
        opacity={0.42}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
