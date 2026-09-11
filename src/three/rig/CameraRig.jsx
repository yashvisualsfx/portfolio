import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { clamp, damp } from '../../animations/easings';
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
 *
 * Every pose is then scaled for the viewport's shape. three.js `fov` is
 * vertical, so a portrait phone sees far less of the world horizontally than
 * the landscape viewport the journey was composed for — which is why an
 * uncompensated 3D scene reads as "correct on desktop, and someone's elbow
 * on mobile". Pulling the camera back along its own view direction restores
 * the framing without moving anything in the scene.
 */

/** The aspect the journey is composed at. */
const REFERENCE_ASPECT = 1.6;

/**
 * Partial compensation (an exponent below 1). Full compensation would frame
 * the width perfectly and leave a phone looking at a distant speck in a very
 * tall frame; this keeps the subject present while bringing the whole form
 * back inside the gutters.
 */
const framingScale = (aspect) =>
  clamp(Math.pow(REFERENCE_ASPECT / Math.max(aspect, 0.1), 0.62), 1, 2.2);
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

  useFrame(({ size }, delta) => {
    const dt = Math.min(delta, 0.1);
    const state = current.current;

    resolvePose(scroll, pose.current);

    const widen = framingScale(size.width / Math.max(size.height, 1));

    // The intro push only applies before the visitor has scrolled.
    const introOffset = started || scroll.progress > 0.002 ? 0 : reduced ? 0 : 4.5;

    const px = pointer.active && !reduced ? pointer.sx : 0;
    const py = pointer.active && !reduced ? pointer.sy : 0;

    // Scale the pose's offset from its own look-at point, so the camera
    // stays on the line it was composed on and only its distance changes.
    const target = pose.current.target;
    const offsetX = (pose.current.position[0] - target[0]) * widen;
    const offsetY = (pose.current.position[1] - target[1]) * widen;
    const offsetZ = (pose.current.position[2] - target[2]) * widen;

    const targetX = target[0] + offsetX + px * 0.55 * intensity;
    const targetY = target[1] + offsetY + py * 0.35 * intensity;
    const targetZ = target[2] + offsetZ + introOffset;

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
