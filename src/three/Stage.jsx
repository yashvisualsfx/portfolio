import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneRoot } from './SceneRoot';
import { bindPointer } from './pointer-state';
import { completeTask } from '../animations/loader-registry';
import { useApp } from '../hooks/useApp';
import { PHASE } from '../context/app-context';
import { SECTION_POSES } from './camera-path';

/**
 * THE STAGE — one WebGL canvas for the whole session.
 *
 * It is created once, never unmounted, and every scene lives inside it. The
 * alternative (a canvas per section) would mean repeated context creation,
 * repeated shader compilation and a visible hitch at every boundary.
 *
 * The canvas is `pointer-events: none` and sits between the two DOM depth
 * layers, so it never intercepts a click and type can pass in front of or
 * behind the 3D world.
 */
export default function Stage({ ctaPressure = 0 }) {
  const { device, reducedMotion, phase } = useApp();

  useEffect(() => bindPointer(), []);

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        dpr={device.dpr}
        frameloop="always"
        camera={{
          fov: SECTION_POSES.hero.from.fov,
          near: 0.1,
          far: 200,
          position: SECTION_POSES.hero.from.position,
        }}
        gl={{
          // Antialiasing is the single biggest fill-rate cost on mobile and
          // the least missed there; DPR already carries most of the quality.
          antialias: !device.isMobile,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        onCreated={() => completeTask('webgl')}
      >
        <SceneRoot
          tier={device.tier}
          isMobile={device.isMobile}
          reduced={reducedMotion}
          started={phase !== PHASE.loading}
          ctaPressure={ctaPressure}
          onReady={() => completeTask('webgl')}
        />
      </Canvas>
    </div>
  );
}
