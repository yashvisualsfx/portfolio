import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { damp } from '../../animations/easings';
import { pointer } from '../pointer-state';
import { scroll } from '../../animations/scroll-state';
import { CAMERA_POSES, resolvePose } from '../camera-path';

/**
 * The camera is never set directly — every value is damped toward a target,
 * so a scroll jump, a resize or a pointer flick can never produce a cut.
 *
 * Targets come from three sources, in order of authority:
 *   1. the scroll pose      where the journey currently is
 *   2. the intro push       a slow move forward as the hero resolves
 *   3. the pointer          a few centimetres of parallax, nothing more
 */
export function CameraRig({ started, reduced, intensity = 1 }) {
  const { camera } = useThree();
  const current = useRef({
    x: CAMERA_POSES.intro.position[0],
    y: CAMERA_POSES.intro.position[1],
    z: CAMERA_POSES.intro.position[2] + (reduced ? 0 : 4.5),
    tx: 0,
    ty: 0,
    tz: 0,
  });
  const pose = useRef({ position: [0, 0, 0], target: [0, 0, 0], fov: 38 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const state = current.current;

    resolvePose(scroll, pose.current);

    // The intro push only applies before the visitor has scrolled.
    const introOffset = started || scroll.progress > 0.002 ? 0 : reduced ? 0 : 4.5;

    const px = pointer.active && !reduced ? pointer.sx : 0;
    const py = pointer.active && !reduced ? pointer.sy : 0;

    const targetX = pose.current.position[0] + px * 0.55 * intensity;
    const targetY = pose.current.position[1] + py * 0.35 * intensity;
    const targetZ = pose.current.position[2] + introOffset;

    // 0.0005 leaves 0.05% of the gap after a second: firm, never rubbery.
    state.x = damp(state.x, targetX, 0.0009, dt);
    state.y = damp(state.y, targetY, 0.0009, dt);
    state.z = damp(state.z, targetZ, 0.0015, dt);
    state.tx = damp(state.tx, pose.current.target[0], 0.0009, dt);
    state.ty = damp(state.ty, pose.current.target[1], 0.0009, dt);
    state.tz = damp(state.tz, pose.current.target[2], 0.0009, dt);

    camera.position.set(state.x, state.y, state.z);
    camera.lookAt(state.tx, state.ty, state.tz);

    const fov = damp(camera.fov, pose.current.fov, 0.002, dt);
    if (Math.abs(fov - camera.fov) > 0.001) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
