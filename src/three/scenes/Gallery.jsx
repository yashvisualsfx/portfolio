import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { clamp, damp } from '../../animations/easings';
import { getSceneProgress } from '../../animations/scroll-state';
import { SCENE_Z, sectionPresence } from '../camera-path';
import { pointer } from '../pointer-state';

/**
 * 05 — HORIZONTAL GALLERY
 *
 * Vertical scroll drives horizontal travel. The panels are real geometry at
 * real depths rather than a CSS perspective trick, so the one nearest the
 * camera genuinely resolves — it grows, it sharpens, and the others fall
 * back into the corridor behind it.
 *
 * Panel height is fixed and width follows each texture's aspect, so nothing
 * is ever stretched to fit a slot.
 */

const PANEL_HEIGHT = 2.7;
const SPACING = 4.6;
const DEPTH_STEP = 2.3;

export function Gallery({ projects, isMobile = false }) {
  const group = useRef(null);
  const panels = useRef([]);
  const sources = useMemo(() => projects.map((project) => project.cover.small), [projects]);
  const textures = useTexture(sources);

  const items = useMemo(
    () =>
      projects.map((project, index) => {
        const texture = Array.isArray(textures) ? textures[index] : textures;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = isMobile ? 2 : 8;
        const image = texture.image;
        const aspect = image && image.height ? image.width / image.height : 1.4;
        return { project, texture, width: PANEL_HEIGHT * aspect };
      }),
    [projects, textures, isMobile],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);

    // The panels exist at a fixed depth for the whole session, so without a
    // gate they would be visible as specks from anywhere else in the corridor.
    const presence = sectionPresence('gallery', { lead: 0.03, tail: 0.02 });
    if (group.current) {
      group.current.visible = presence > 0.01;
      if (!group.current.visible) return;
    }

    const progress = clamp(getSceneProgress('gallery'));
    const head = progress * (items.length - 1);

    for (let i = 0; i < items.length; i += 1) {
      const mesh = panels.current[i];
      if (!mesh) continue;

      const distance = i - head;
      const near = clamp(1 - Math.min(Math.abs(distance), 1.6) / 1.6);

      const targetX = distance * SPACING;
      const targetZ = SCENE_Z.gallery - Math.abs(distance) * DEPTH_STEP;
      const targetScale = 0.78 + near * 0.22;

      mesh.position.x = damp(mesh.position.x, targetX, 0.0015, dt);
      mesh.position.z = damp(mesh.position.z, targetZ, 0.0015, dt);
      mesh.position.y = damp(mesh.position.y, -distance * 0.18, 0.0015, dt);
      mesh.scale.setScalar(damp(mesh.scale.x, targetScale, 0.0015, dt));

      // Panels turn slightly toward the camera as they arrive.
      mesh.rotation.y = damp(mesh.rotation.y, distance * 0.14, 0.002, dt);

      // The far panels dim rather than disappear: depth, not a switch.
      const material = mesh.material;
      material.opacity = damp(material.opacity, (0.25 + near * 0.75) * presence, 0.002, dt);
      material.color.setScalar(damp(material.color.r, 0.4 + near * 0.6, 0.002, dt));
    }

    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, pointer.sx * 0.04, 0.004, dt);
      group.current.rotation.x = damp(group.current.rotation.x, pointer.sy * -0.03, 0.004, dt);
    }
  });

  return (
    <group ref={group} name="gallery">
      {items.map((item, index) => (
        <mesh
          key={item.project.id}
          ref={(node) => {
            panels.current[index] = node;
          }}
          position={[index * SPACING, 0, SCENE_Z.gallery]}
        >
          <planeGeometry args={[item.width, PANEL_HEIGHT]} />
          <meshBasicMaterial
            map={item.texture}
            transparent
            opacity={0}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
