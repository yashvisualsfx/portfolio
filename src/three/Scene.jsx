import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { HeroSculpture } from "./HeroSculpture.jsx";
import { Lighting } from "./Lighting.jsx";
import { easeSignature } from "../animations/easing.js";
import { CAMERA_PATH, sampleCamera } from "./cameraPath.js";
import { usePointerRef } from "../hooks/usePointerRef.js";

/*
  The site's single WebGL canvas.

  Mounted once behind every section and kept for the life of the page — later
  phases travel the camera through it to reach new scenes rather than tearing
  down and rebuilding a GL context per section.
*/

const CAMERA_START_Z = 9.2;
const CAMERA_REST_Z = 6;

/*
  Where the form sits, in world units, relative to a camera that stays on
  centre. Placing the object rather than dollying the camera sideways keeps
  the framing readable: these numbers map directly onto the hero layout.

  At fov 35 and z 6 the frame is ~3.8 units tall, so a 16:10 viewport spans
  roughly x -3 .. 3 and the form's own radius is ~1.9 before scaling. The
  wordmark occupies the lower left out to about x 1, which leaves the upper
  right — placed so the band stays inside the frame while its lower edge
  passes behind the H, which is where the depth actually reads.
*/
function composition(size) {
  const portrait = size.height >= size.width;
  return portrait
    ? // A phone has no room beside the type and only ~0.87 units of half
      // width, so the form shrinks and sits clear above the wordmark.
      { x: 0, y: 0.8, scale: 0.42 }
    : { x: 1.5, y: 0.4, scale: 0.68 };
}

/*
  Camera control, in two stages that hand off to each other.

  Stage one is the opening dolly, on its own clock, running while the
  preloader's panels part. Stage two is the scroll sequence: once the pinned
  hero starts moving, the camera follows the authored path in cameraPath.js,
  travelling in through the sculpture and out the far side.

  The two are blended rather than switched — the intro's remaining distance is
  simply added to the path's first key, so there is no visible seam if a
  visitor starts scrolling before the opening finishes.
*/
function CameraRig({ intro, animate, pointerRef, sequenceRef, placement }) {
  const { camera, invalidate } = useThree();
  const introProgress = useRef(animate ? 0 : 1);

  // Reused across frames so the path sampler never allocates.
  const target = useRef({ position: new THREE.Vector3(), lookAt: new THREE.Vector3() });
  const smoothedLookAt = useRef(new THREE.Vector3());

  // Reduced motion never runs the frame loop, so the rest pose is set once
  // here — the composition survives, the movement doesn't.
  useEffect(() => {
    if (animate) return;
    const rest = CAMERA_PATH[0];
    camera.position.set(
      placement.x + rest.position[0],
      placement.y + rest.position[1],
      rest.position[2],
    );
    camera.lookAt(placement.x + rest.lookAt[0], placement.y + rest.lookAt[1], rest.lookAt[2]);
    invalidate();
  }, [animate, camera, invalidate, placement]);

  useFrame((state, delta) => {
    // A backgrounded tab resumes with a huge delta, which would snap every
    // damped value instead of easing it.
    const dt = Math.min(delta, 1 / 30);

    if (intro && introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + dt / 2.6);
    }
    const settle = easeSignature(introProgress.current);

    const sequence = sequenceRef?.current?.hero ?? 0;
    const pointer = pointerRef?.current ?? { x: 0, y: 0 };

    const { position, lookAt } = target.current;
    sampleCamera(sequence, position, lookAt);

    // The path is authored around the form, so shift it to wherever this
    // viewport placed the form, and scale the approach with the form's size —
    // a smaller object on a phone needs a proportionally tighter path.
    const reach = placement.scale / 0.68;
    position.set(
      placement.x + position.x * reach,
      placement.y + position.y * reach,
      position.z * reach,
    );
    lookAt.set(placement.x + lookAt.x * reach, placement.y + lookAt.y * reach, lookAt.z * reach);

    // The opening push adds its remaining distance on top of the path, so the
    // two stages blend instead of fighting for the camera.
    position.z += (1 - settle) * (CAMERA_START_Z - CAMERA_REST_Z);

    // Parallax is deliberately small, on the camera rather than the form, and
    // fades out as the sequence takes over — a cursor nudging the camera
    // mid-flight would read as a wobble.
    const parallax = 1 - Math.min(sequence * 2, 1);
    position.x += pointer.x * 0.3 * parallax;
    position.y += -pointer.y * 0.22 * parallax;

    // Damping is what keeps a scrubbed camera from jittering with the
    // scrollbar; the path supplies the shape, this supplies the weight.
    camera.position.x = THREE.MathUtils.damp(camera.position.x, position.x, 6, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, position.y, 6, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, position.z, 6, dt);

    smoothedLookAt.current.x = THREE.MathUtils.damp(smoothedLookAt.current.x, lookAt.x, 6, dt);
    smoothedLookAt.current.y = THREE.MathUtils.damp(smoothedLookAt.current.y, lookAt.y, 6, dt);
    smoothedLookAt.current.z = THREE.MathUtils.damp(smoothedLookAt.current.z, lookAt.z, 6, dt);
    camera.lookAt(smoothedLookAt.current);
  });

  return null;
}

/*
  Places the form for the current viewport and hands the same placement to the
  camera rig, so the authored path stays anchored to the object wherever the
  layout puts it. R3F re-renders this on resize.
*/
function Composition({ intro, animate, isTouch, pointerRef, sequenceRef }) {
  const size = useThree((state) => state.size);
  const placement = composition(size);

  return (
    <>
      <CameraRig
        intro={intro}
        animate={animate}
        pointerRef={pointerRef}
        sequenceRef={sequenceRef}
        placement={placement}
      />
      <HeroSculpture
        count={isTouch ? 32 : 64}
        intro={intro}
        animate={animate}
        placement={placement}
        pointerRef={pointerRef}
        sequenceRef={sequenceRef}
      />
    </>
  );
}

/**
 * @param {boolean} intro    true once the preloader begins revealing
 * @param {boolean} reduced  prefers-reduced-motion — render one frame, don't loop
 * @param {boolean} isTouch  halves the ring count and drops cursor parallax
 * @param {object}  sequenceRef  hero scroll progress, written by ScrollTrigger
 */
export default function Scene({ intro = false, reduced = false, isTouch = false, sequenceRef }) {
  const pointerRef = usePointerRef({ enabled: !isTouch && !reduced });

  // Capped rather than native: beyond ~1.75 the extra pixels cost real frames
  // and buy nothing visible on a form drawn in specular highlights.
  const [dpr, setDpr] = useState(() =>
    reduced ? 1 : Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 1.75),
  );

  const animate = !reduced;

  return (
    <Canvas
      frameloop={animate ? "always" : "demand"}
      dpr={dpr}
      camera={{ fov: 35, position: [0, 0, CAMERA_START_Z], near: 0.1, far: 40 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      style={{ pointerEvents: "none" }}
    >
      {/* Shed resolution rather than frames when a device can't keep up —
          a soft image reads far better than a stuttering one. */}
      <PerformanceMonitor
        onDecline={() => setDpr((current) => Math.max(1, current - 0.35))}
      />

      <Suspense fallback={null}>
        <Lighting sequenceRef={sequenceRef} animate={animate} />
        <Composition
          intro={intro}
          animate={animate}
          isTouch={isTouch}
          pointerRef={pointerRef}
          sequenceRef={sequenceRef}
        />
      </Suspense>
    </Canvas>
  );
}
