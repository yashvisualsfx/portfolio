/**
 * Selected work. Each record owns one full-height scroll scene, so it
 * carries the editorial copy, the media and the staging hints the 3D layer
 * reads: `tone` tints the scene's key light, `depth` is its step along the
 * corridor.
 *
 * Media contract (see scripts/optimize-media.mjs):
 *   cover   a still, always present — nothing ever waits on video to paint
 *   reel    an optional muted loop, requested only on hover / in view
 *
 * `orientation` is the shape of the artwork, not a style choice. Poster work
 * is 3:4 and product work is 4:3; forcing one frame on both crops a movie
 * poster down to a horizontal strip. The layout gives each orientation its
 * own column span so every cover lands at roughly the same HEIGHT — which is
 * what makes the sequence feel even as you scroll, rather than equal widths.
 */

import { asset } from './asset';

const still = (src, alt) => ({
  src: asset(`${src}.webp`),
  small: asset(`${src}@sm.webp`),
  alt,
});

const reel = (src, poster) => ({ src: asset(src), poster: asset(poster) });

export const PROJECTS = [
  {
    id: 'realme',
    orientation: 'landscape',
    aspect: '4 / 3',
    index: '01',
    title: 'Realme Earbuds',
    category: 'Brand Identity',
    year: '2025',
    client: 'Realme — concept',
    role: 'Art direction, key visual',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'A sound-reactive product key visual built around bass, silence and speed.',
    description:
      'A high-energy product campaign that treats the earbud as a sculptural object: hard studio light, a reactive waveform system, and typography tuned to the pace of the sound it describes.',
    cover: still('/media/images/realme', 'Realme earbuds campaign key visual'),
    tone: '#2a2f3a',
    depth: 0,
  },
  {
    id: 'motion',
    orientation: 'landscape',
    aspect: '4 / 3',
    index: '02',
    title: 'Vision Explainer',
    category: 'Motion Design',
    year: '2025',
    client: 'Tech brand — concept',
    role: 'Motion design, edit',
    tools: ['After Effects', 'Premiere Pro'],
    summary: 'Product motion design: typography keyframed to the breath of the hardware.',
    description:
      'A luxury product explainer built on restraint — ultra-clean type choreography, fluid screen transitions and a pacing curve that lets each feature land before the next arrives.',
    cover: still('/media/posters/lv-watch', 'Luxury product motion design frame'),
    reel: reel('/media/videos/motion-graphics.mp4', '/media/videos/motion-graphics-poster.webp'),
    tone: '#23282b',
    depth: 1,
  },
  {
    id: 'kinetic',
    orientation: 'square',
    aspect: '1 / 1',
    index: '03',
    title: 'Piche Tere',
    category: 'UI / UX Experience',
    year: '2025',
    client: 'Independent release',
    role: 'Concept, kinetic type',
    tools: ['After Effects', 'Cinema 4D'],
    summary: 'CRT wave distortion and dimensional type, cut to the beat.',
    description:
      'A kinetic typography piece for a music release: custom CRT distortion, dimensional type rotation and beat-locked edits that make the lyric feel physically present in the frame.',
    cover: still('/media/images/nike', 'Kinetic typography frame'),
    reel: reel('/media/videos/kinetic-type.mp4', '/media/videos/kinetic-type-poster.webp'),
    tone: '#302028',
    depth: 2,
  },
  {
    id: 'posters',
    orientation: 'portrait',
    aspect: '3 / 4',
    index: '04',
    title: 'Poster Series',
    category: '3D Visual',
    year: '2024 — 2025',
    client: 'Self-initiated',
    role: 'Design, retouch, 3D',
    tools: ['Photoshop', 'Blender'],
    summary: 'Alternate film posters and automotive studies in dual-tone light.',
    description:
      'An ongoing print series: cinematic photo manipulation, single-source lighting, and layouts that carry the whole story in one frame — from Titanic re-imagined to the Shelby in monochrome.',
    cover: still('/media/posters/titanic', 'Alternate Titanic film poster'),
    tone: '#262229',
    depth: 3,
  },
  {
    id: 'cinematic',
    orientation: 'portrait',
    aspect: '3 / 4',
    index: '05',
    title: 'Cinematic Edit',
    category: 'Film / Video',
    year: '2025',
    client: 'Self-initiated',
    role: 'Edit, sound design, grade',
    tools: ['Premiere Pro', 'After Effects', 'DaVinci'],
    summary: 'Beat-matched transitions, a two-source grade, sound cut to the frame.',
    description:
      'A short-form cinematic edit engineered around impact: transitions placed on the beat, a grade built from two light sources, and sound design that carries the cut rather than decorating it.',
    cover: still('/media/posters/mustang-cobra', 'Automotive cinematic still'),
    reel: reel('/media/videos/cinematic-edit.mp4', '/media/videos/cinematic-edit-poster.webp'),
    tone: '#1f2630',
    depth: 4,
  },
  {
    id: 'experimental',
    orientation: 'portrait',
    aspect: '3 / 4',
    index: '06',
    title: 'Signal / Iris',
    category: 'Experimental',
    year: '2026',
    client: 'Studio research',
    role: 'Direction, WebGL, motion',
    tools: ['Three.js', 'GLSL', 'After Effects'],
    summary: 'Ongoing research into distortion, depth and real-time material.',
    description:
      'A running experiment in real-time image making: refraction, displacement, and the point where a rendered surface stops reading as a render and starts reading as material.',
    cover: still('/media/images/wildcraft', 'Experimental refraction study'),
    reel: reel('/media/videos/eye.mp4', '/media/videos/eye-poster.webp'),
    tone: '#1c2321',
    depth: 5,
  },
];

/** The horizontal gallery reuses the same records — never a second copy. */
export const GALLERY_PROJECTS = PROJECTS.slice(0, 4);

export const getProjectById = (id) => PROJECTS.find((project) => project.id === id);
