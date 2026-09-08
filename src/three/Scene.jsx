import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { HeroSculpture } from "./HeroSculpture.jsx";
import { Lighting } from "./Lighting.jsx";
import { easeSignature } from "../animations/easing.js";
import { usePointerRef } from "../hooks/usePointerRef.js";
import { useScrollRef } from "../hooks/useScrollRef.js";

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

/** The opening dolly, plus a little cursor parallax on the camera itself. */
function CameraRig({ intro, animate, pointerRef, scrollRef }) {
  const { camera, invalidate } = useThree();
  const progress = useRef(animate ? 0 : 1);

  // Reduced motion never runs the frame loop, so the rest pose is set once
  // here — the composition survives, the movement doesn't.
  useEffect(() => {
    if (animate) return;
    camera.position.set(0, 0, CAMERA_REST_Z);
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [animate, camera, invalidate]);

  useFrame((state, delta) => {
    // A backgrounded tab resumes with a huge delta, which would snap every
    // damped value instead of easing it.
    const dt = Math.min(delta, 1 / 30);

    if (intro && progress.current < 1) {
      progress.current = Math.min(1, progress.current + dt / 2.6);
    }
    const settle = easeSignature(progress.current);

    const scroll = scrollRef?.current?.viewports ?? 0;
    const pointer = pointerRef?.current ?? { x: 0, y: 0 };

    // The opening push: the camera starts back and travels in while the
    // preloader's panels part, so reveal and dolly read as one move.
    const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_REST_Z, settle) - scroll * 0.6;

    // Parallax is deliberately small and on the camera rather than the form —
    // it shifts the viewpoint, which reads as depth, instead of waving the
    // object around.
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.3, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -pointer.y * 0.22, 3, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, dt);

    camera.lookAt(0, 0, 0);
  });

  return null;
}

/** Places the form for the current viewport; R3F re-renders this on resize. */
function Composition(props) {
  const size = useThree((state) => state.size);
  return <HeroSculpture placement={composition(size)} {...props} />;
}

/**
 * @param {boolean} intro    true once the preloader begins revealing
 * @param {boolean} reduced  prefers-reduced-motion — render one frame, don't loop
 * @param {boolean} isTouch  halves the ring count and drops cursor parallax
 */
export default function Scene({ intro = false, reduced = false, isTouch = false }) {
  const pointerRef = usePointerRef({ enabled: !isTouch && !reduced });
  const scrollRef = useScrollRef();

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
        <Lighting />
        <CameraRig
          intro={intro}
          animate={animate}
          pointerRef={pointerRef}
          scrollRef={scrollRef}
        />
        <Composition
          count={isTouch ? 32 : 64}
          intro={intro}
          animate={animate}
          pointerRef={pointerRef}
          scrollRef={scrollRef}
        />
      </Suspense>
    </Canvas>
  );
}
