import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { Monolith } from './scenes/Monolith';
import { Gallery } from './scenes/Gallery';
import { Dust } from './scenes/Dust';
import { OrbitForm } from './scenes/OrbitForm';
import { StatementBar } from './scenes/StatementBar';
import { Finale } from './scenes/Finale';
import { GALLERY_PROJECTS } from '../data/projects';
import { CameraRig } from './rig/CameraRig';
import { pointer } from './pointer-state';
import { damp } from '../animations/easings';

/**
 * Everything inside the persistent canvas. Scenes are mounted once and live
 * for the whole session at their own depth in the corridor — they are never
 * created or destroyed on scroll, only travelled past.
 */
export function SceneRoot({ tier, isMobile, reduced, started, ctaPressure = 0, onReady }) {
  const { gl } = useThree();
  const readyRef = useRef(false);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
  }, [gl]);

  // Smooth the raw pointer once per frame, centrally: every scene reads the
  // same damped value instead of each one filtering it again.
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.1);

    // Development aid: lets the QA harness read where the camera actually is
    // when a scene looks wrong. Stripped from production builds.
    if (import.meta.env.DEV) {
      window.__camera = { z: camera.position.z, x: camera.position.x, fov: camera.fov };
    }
    pointer.sx = damp(pointer.sx, pointer.x, 0.0025, dt);
    pointer.sy = damp(pointer.sy, pointer.y, 0.0025, dt);

    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  });

  const slabCount = isMobile ? 7 : tier === 'high' ? 13 : 11;

  return (
    <>
      <CameraRig started={started} reduced={reduced} intensity={isMobile ? 0.4 : 1} />
      <Lighting resolution={isMobile ? 128 : 256} reduced={reduced} />
      <Monolith count={slabCount} reduced={reduced} accentIndex={Math.floor(slabCount / 2)} />
      <StatementBar reduced={reduced} />
      <Finale count={isMobile ? 7 : 9} reduced={reduced} pressure={ctaPressure} />
      <OrbitForm detail={isMobile ? 1 : tier === 'high' ? 2 : 1} reduced={reduced} />
      <Dust count={isMobile ? 280 : tier === 'high' ? 800 : 500} reduced={reduced} />

      {/* Gallery textures are fetched when the chunk resolves, not at boot;
          until then the corridor simply has nothing in it. */}
      <Suspense fallback={null}>
        <Gallery projects={GALLERY_PROJECTS} isMobile={isMobile} />
      </Suspense>
    </>
  );
}
