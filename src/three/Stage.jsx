import { useCallback, useEffect, useRef, useState } from 'react';
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
export default function Stage({ ctaPressure = 0, paused = false }) {
  const { device, reducedMotion, phase } = useApp();
  const [dprScale, setDprScale] = useState(1);
  const floorRef = useRef(0.6);

  useEffect(() => bindPointer(), []);

  /**
   * Resolution is the cheapest quality dial there is: halving it quarters the
   * fill rate and costs far less, perceptually, than dropping geometry or
   * lighting. It is stepped rather than continuous so a device hovering at
   * the threshold cannot oscillate.
   */
  const onPerformanceChange = useCallback((event) => {
    setDprScale((current) => {
      if (event === 'fallback') return floorRef.current;
      if (event === 'decline') return Math.max(floorRef.current, current - 0.2);
      return Math.min(1, current + 0.1);
    });
  }, []);

  const [min, max] = device.dpr;

  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        dpr={[min, Math.max(min, max * dprScale)]}
        // Nothing is visible behind a fullscreen dialog: a paused loop there
        // is a whole GPU's worth of work not being done for no one.
        frameloop={paused ? 'never' : 'always'}
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
          onPerformanceChange={onPerformanceChange}
        />
      </Canvas>
    </div>
  );
}
