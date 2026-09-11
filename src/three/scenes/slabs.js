import * as THREE from 'three';

/**
 * The slab stack is the site's core form. The monolith opens out of it and
 * the finale re-forms into it, so its proportions live here rather than in
 * either scene — the closing shape is recognisably the opening one.
 */

export const SLAB_HEIGHT = 0.3;
export const SLAB_GAP = 0.022; // Closed, the seams read as machined lines.
export const ACCENT_HEIGHT = 0.1;

export function buildSlabs(count, accentIndex) {
  const items = [];
  const half = (count - 1) / 2;

  for (let i = 0; i < count; i += 1) {
    const t = (i - half) / half; // -1 → 1, 0 at the waist
    const taper = 1 - Math.abs(t) ** 1.8 * 0.44;
    // The accent is a seam set into the waist, not a plate laid across it.
    const inset = i === accentIndex ? 0.56 : 1;

    items.push({
      i,
      t,
      width: 2.9 * taper * inset,
      depth: 1.15 * taper * inset,
      height: i === accentIndex ? ACCENT_HEIGHT : SLAB_HEIGHT,
      y: (i - half) * (SLAB_HEIGHT + SLAB_GAP),
      phase: i * 0.6,
    });
  }

  return items;
}

/**
 * `fadeable` opts a material into the transparent render path. Only the
 * scenes that actually fade ask for it: a transparent material is sorted
 * rather than depth-tested against its siblings, which a thirteen-slab stack
 * does not want for free.
 */
export function createSlabMaterial({ fadeable = false } = {}) {
  return new THREE.MeshStandardMaterial({
    color: '#96938e',
    metalness: 0.96,
    roughness: 0.17,
    envMapIntensity: 1.15,
    transparent: fadeable,
    opacity: 1,
  });
}

export function createAccentMaterial({ fadeable = false } = {}) {
  return new THREE.MeshStandardMaterial({
    color: '#2a1a14',
    metalness: 0.6,
    roughness: 0.32,
    emissive: new THREE.Color('#e2552d'),
    emissiveIntensity: 0.7,
    transparent: fadeable,
    opacity: 1,
  });
}
