import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { easeSignature } from "../animations/easing.js";

/*
  The hero form.

  A torus described by rings rather than a surface: N thin circles carried
  around a central path, each tilted progressively so the set reads as one
  twisting band. Chosen over a primitive because it is unmistakably designed
  rather than default — and because it costs a single instanced draw call, so
  the "object count" that drops on mobile is a real geometry saving.

  It is deliberately dark, near-black metal: the form is drawn by specular
  highlights raking across it, which keeps it sitting inside the palette
  instead of glowing on top of it.
*/

// A whole number of turns closes the band on itself; a fractional one leaves
// a visible seam where the first and last rings meet.
const TWIST_TURNS = 2;
const PATH_RADIUS = 1.45;

/** Writes the rest pose for every ring into the instance matrices. */
function composeRings(mesh, count, twist) {
  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i += 1) {
    const theta = (i / count) * Math.PI * 2;

    dummy.position.set(Math.cos(theta) * PATH_RADIUS, 0, Math.sin(theta) * PATH_RADIUS);

    // Face the ring along the path tangent, then tilt it about its own radial
    // axis — tilting is what makes the twist visible, since spinning a circle
    // about its own normal changes nothing.
    dummy.rotation.set(0, -theta, 0);
    dummy.rotateX(theta * twist);

    // Gentle size modulation so the band breathes instead of reading as a
    // machined, uniform part.
    dummy.scale.setScalar(1 + Math.sin(theta * 3) * 0.12);

    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
}

/**
 * @param {number}  count      rings — the mobile tier halves this
 * @param {boolean} intro      run the settle-into-place animation
 * @param {boolean} animate    false under reduced motion: pose it and stop
 * @param {object}  pointerRef normalized cursor, sampled per frame
 * @param {object}  scrollRef  scroll position, sampled per frame
 */
export function HeroSculpture({
  count = 64,
  intro = false,
  animate = true,
  placement = { x: 0, y: 0, scale: 1 },
  pointerRef,
  scrollRef,
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const introProgress = useRef(animate ? 0 : 1);

  const geometry = useMemo(
    // Thin tube, low radial resolution — at this scale the cross-section
    // reads as a highlight, not a shape, so segments there are wasted.
    () => new THREE.TorusGeometry(0.42, 0.018, 6, 48),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        // Warm near-black rather than a colour: everything you see on these
        // rings is reflected light, so the base tone only has to sit inside
        // the palette without competing with the type.
        color: new THREE.Color("#2a2622"),
        metalness: 1,
        roughness: 0.14,
        envMapIntensity: 2.4,
      }),
    [],
  );

  useLayoutEffect(() => {
    if (meshRef.current) composeRings(meshRef.current, count, TWIST_TURNS);
  }, [count]);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Reduced motion renders on demand, so the frame loop below never runs —
  // the settled pose is applied once instead.
  useLayoutEffect(() => {
    if (animate || !groupRef.current) return;
    groupRef.current.rotation.set(-0.22, 0, 0);
    groupRef.current.position.y = 0;
  }, [animate]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    // Clamp: a background tab resumes with a huge delta, which would snap
    // every damped value instead of easing it.
    const dt = Math.min(delta, 1 / 30);

    if (intro && introProgress.current < 1) {
      introProgress.current = Math.min(1, introProgress.current + dt / 2.2);
    }
    const settle = easeSignature(introProgress.current);

    const scroll = scrollRef?.current?.viewports ?? 0;
    const pointer = pointerRef?.current ?? { x: 0, y: 0 };

    // Idle: a slow constant drift, plus the last of the intro rotation
    // unwinding into it so the two read as one continuous move.
    const idle = animate ? state.clock.elapsedTime * 0.06 : 0;
    const introSpin = (1 - settle) * Math.PI * 0.55;

    // Scroll response stays modest here — Phase 5 owns the full camera and
    // object choreography; this is only enough that the form feels attached
    // to the page rather than floating over it.
    const targetY = idle + introSpin + scroll * 0.35 + pointer.x * 0.16;
    const targetX = -0.22 + pointer.y * 0.1 + scroll * 0.12;

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 4, dt);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 4, dt);

    // Rises into frame as it settles, then drifts with the page.
    const targetPosY = THREE.MathUtils.lerp(-1.1, 0, settle) - scroll * 0.45;
    group.position.y = THREE.MathUtils.damp(group.position.y, targetPosY, 5, dt);

    group.scale.setScalar(THREE.MathUtils.lerp(0.82, 1, settle));
  });

  // Outer group holds the layout — where this sits for the current viewport.
  // Inner group holds the motion, so the two never have to be reconciled.
  return (
    <group position={[placement.x, placement.y, 0]} scale={placement.scale}>
      <group ref={groupRef}>
        <instancedMesh
          ref={meshRef}
          args={[geometry, material, count]}
          frustumCulled={false}
        />
      </group>
    </group>
  );
}
