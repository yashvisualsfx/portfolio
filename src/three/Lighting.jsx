import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { computePresence } from "./cameraPath.js";

/*
  Lighting is built from lightformers rendered into a local cubemap rather
  than an HDRI preset — drei's presets stream from a CDN, and the environment
  needs to be part of the build, not a network dependency.

  The form is metal, so these emitters *are* the image: what you see on the
  rings is their reflection. Three sources, doing three jobs — a warm key that
  rakes the top edge, a cool fill that keeps the shadow side from going flat
  black, and one small accent that puts the site's single colour into the
  scene as a highlight rather than a wash.
*/
export function Lighting({ accent = "#ff5a36", sequenceRef, animate = true }) {
  const keyRef = useRef();
  const ambientRef = useRef();

  // The baked cubemap can't change (frames={1}), so the scene's mood shifts
  // through the direct lights instead: the key cools and lifts as the camera
  // travels into the form, then falls back once it's through.
  useFrame((state, delta) => {
    if (!animate || !keyRef.current) return;
    const dt = Math.min(delta, 1 / 30);
    const sequence = sequenceRef?.current?.hero ?? 0;

    // Peaks mid-flight, at the moment the camera is inside the band.
    const swell = Math.sin(Math.min(Math.max(sequence, 0), 1) * Math.PI);

    // Scaled by the same presence the material uses, so the form actually
    // recedes through the work sections instead of staying lit by the key
    // while only its reflections fade.
    const presence = computePresence(sequenceRef?.current ?? {});

    keyRef.current.intensity = THREE.MathUtils.damp(
      keyRef.current.intensity,
      (0.5 + swell * 1.1) * presence,
      4,
      dt,
    );
    ambientRef.current.intensity = THREE.MathUtils.damp(
      ambientRef.current.intensity,
      (0.12 + swell * 0.18) * presence,
      4,
      dt,
    );
  });

  return (
    <>
      {/* frames={1} — nothing in the environment moves, so it is rendered
          once and reused rather than every frame. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#050505"]} />

        {/* Key: broad warm white, upper right, angled across the form. */}
        <Lightformer
          form="rect"
          intensity={6}
          color="#fff4e6"
          position={[3.5, 4, 2]}
          rotation={[-Math.PI / 3.2, 0.6, 0]}
          scale={[9, 5, 1]}
        />

        {/* Fill: cool and dim, opposite side, to model the shadow edge. */}
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#9fb4c8"
          position={[-5, 0.5, -1.5]}
          rotation={[0, Math.PI / 2.4, 0]}
          scale={[7, 6, 1]}
        />

        {/* Accent: small, low and behind — reads as a rim catch on the
            underside of the rings, never as ambient colour. */}
        <Lightformer
          form="circle"
          intensity={4.5}
          color={accent}
          position={[-1.4, -2.6, -3]}
          rotation={[Math.PI / 2.6, 0, 0]}
          scale={[3, 3, 1]}
        />
      </Environment>

      {/* A touch of direct light so the geometry keeps some diffuse shape
          definition; metal takes almost all of its look from the map above. */}
      <ambientLight ref={ambientRef} intensity={0.12} />
      <directionalLight ref={keyRef} position={[4, 5, 3]} intensity={0.5} color="#fff2e4" />
    </>
  );
}
