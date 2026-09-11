import { Environment, Lightformer } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { damp, clamp } from '../animations/easings';
import { scroll } from '../animations/scroll-state';

/**
 * Lighting is built, not downloaded: the environment is a small set of
 * emissive planes rendered once into a cube target. No HDR fetch, no
 * megabytes, and full authorship over where the highlights fall — which is
 * what makes metal read as metal rather than as grey plastic.
 *
 * The key light's colour drifts across the journey (cool at the monolith,
 * warmer through the work, cold again at the finale) so the atmosphere
 * changes with the scroll without anything visibly "switching".
 */

const KEY_STOPS = [
  { at: 0.0, color: '#cfd6e4' },
  { at: 0.2, color: '#e8e2d8' },
  { at: 0.5, color: '#f0dcc9' },
  { at: 0.75, color: '#d8dde6' },
  { at: 1.0, color: '#c6ccd8' },
];

export function Lighting({ resolution = 256, reduced = false }) {
  const keyRef = useRef(null);
  const rimRef = useRef(null);

  const stops = useMemo(
    () => KEY_STOPS.map((stop) => ({ at: stop.at, color: new THREE.Color(stop.color) })),
    [],
  );
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    if (!keyRef.current) return;
    const dt = Math.min(delta, 0.1);
    const p = clamp(scroll.progress);

    let lower = stops[0];
    let upper = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i += 1) {
      if (p >= stops[i].at && p <= stops[i + 1].at) {
        lower = stops[i];
        upper = stops[i + 1];
        break;
      }
    }
    const span = upper.at - lower.at;
    const t = span > 0 ? (p - lower.at) / span : 0;
    target.copy(lower.color).lerp(upper.color, t);

    keyRef.current.color.lerp(target, reduced ? 1 : 1 - Math.pow(0.05, dt));

    if (rimRef.current) {
      // The rim lifts as the work section opens up and settles again at the end.
      const lift = 1.6 + Math.sin(p * Math.PI) * 1.4;
      rimRef.current.intensity = damp(rimRef.current.intensity, lift, 0.02, dt);
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight ref={keyRef} position={[4, 6, 4]} intensity={2.2} color="#cfd6e4" />
      <directionalLight ref={rimRef} position={[-5, -2, -4]} intensity={1.6} color="#e2552d" />

      {/* Rendered once (frames={1}) — a static environment costs one pass at
          mount and nothing thereafter. */}
      <Environment frames={1} resolution={resolution}>
        <Lightformer
          form="rect"
          intensity={4.4}
          color="#ffffff"
          position={[0, 5, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 6, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.15}
          color="#ffe2d0"
          position={[6, 0.5, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#9fb4d8"
          position={[-6, -1, 1]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 5, 1]}
        />
        <Lightformer
          form="ring"
          intensity={1.1}
          color="#ffffff"
          position={[0, 0, 7]}
          scale={[4, 4, 1]}
        />
      </Environment>
    </>
  );
}
