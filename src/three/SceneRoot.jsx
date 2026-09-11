import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { Monolith } from './scenes/Monolith';
import { Gallery } from './scenes/Gallery';
import { Dust } from './scenes/Dust';
import { OrbitForm } from './scenes/OrbitForm';
import { GALLERY_PROJECTS } from '../data/projects';
import { CameraRig } from './rig/CameraRig';
import { pointer } from './pointer-state';
import { damp } from '../animations/easings';

/**
 * Everything inside the persistent canvas. Scenes are mounted once and live
 * for the whole session at their own depth in the corridor — they are never
 * created or destroyed on scroll, only travelled past.
 *
 * Three forms, deliberately. An earlier version also put a slab across the
 * closing statement and re-formed the stack behind the contact section; with
 * the gallery panels that made five things competing for attention, and the
 * back half of the site started reading as a showreel for the renderer
 * rather than for the work. The statement and the contact are now pure type.
 */
export function SceneRoot({
  tier,
  isMobile,
  reduced,
  started,
  onReady,
  onPerformanceChange,
}) {
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

  // Fewer, heavier slabs: the stack reads as one carved object rather than a
  // pile of plates, and it costs a third of the draw calls it used to.
  const slabCount = isMobile ? 5 : tier === 'high' ? 7 : 7;

  return (
    <>
      {/* Measured frame time is the only honest signal about a device.
          Cores and user-agent guesses set the starting point; this corrects
          it, dropping resolution before the experience starts to stutter. */}
      <PerformanceMonitor
        onDecline={() => onPerformanceChange?.('decline')}
        onIncline={() => onPerformanceChange?.('incline')}
        flipflops={3}
        onFallback={() => onPerformanceChange?.('fallback')}
      />
      <CameraRig started={started} reduced={reduced} intensity={isMobile ? 0.4 : 1} />
      <Lighting resolution={isMobile ? 128 : 256} reduced={reduced} />
      <Monolith count={slabCount} reduced={reduced} accentIndex={Math.floor(slabCount / 2)} />
      <OrbitForm detail={isMobile ? 1 : tier === 'high' ? 2 : 1} reduced={reduced} />
      <Dust count={isMobile ? 120 : 260} reduced={reduced} />

      {/* Gallery textures are fetched when the chunk resolves, not at boot;
          until then the corridor simply has nothing in it. */}
      <Suspense fallback={null}>
        <Gallery projects={GALLERY_PROJECTS} isMobile={isMobile} />
      </Suspense>
    </>
  );
}
