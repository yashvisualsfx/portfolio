/**
 * Selected work. Each project owns one full-height scroll scene, so the
 * record carries both editorial copy and the staging hints the 3D layer
 * reads (`tone` tints the scene's key light; `depth` seeds its Z offset).
 *
 * Media paths point at /public/media and are requested lazily.
 */

export const PROJECTS = [
  {
    id: 'realme',
    index: '01',
    title: 'Realme Earbuds',
    category: 'Brand Identity',
    year: '2025',
    client: 'Realme — concept',
    role: 'Art direction, key visual',
    tools: ['Photoshop', 'Illustrator'],
    summary: 'A sound-reactive product key visual built around bass, silence and speed.',
    description:
      'A high-energy product campaign that treats the earbud as a sculptural object: hard studio light, a reactive waveform system and typography tuned to the pace of the sound it describes.',
    cover: { type: 'image', src: '/media/images/realme.png', alt: 'Realme earbuds product campaign key visual' },
    tone: '#2A2F3A',
    depth: 0,
  },
  {
    id: 'motion',
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
    cover: { type: 'video', src: '/media/videos/motion-graphics.mp4', poster: '/media/images/realme.png', alt: 'Motion design explainer sequence' },
    tone: '#23282B',
    depth: 1,
  },
  {
    id: 'kinetic',
    index: '03',
    title: 'Piche Tere',
    category: 'UI / UX Experience',
    year: '2025',
    client: 'Independent release',
    role: 'Concept, kinetic type',
    tools: ['After Effects', 'Cinema 4D'],
    summary: 'CRT wave distortion and 3D type, cut to the beat.',
    description:
      'A kinetic typography piece for a music release: custom CRT distortion, dimensional type rotation and beat-locked edits that make the lyric feel physically present in the frame.',
    cover: { type: 'video', src: '/media/videos/kinetic-type.mp4', poster: '/media/images/nike.png', alt: 'Kinetic typography music video' },
    tone: '#302028',
    depth: 2,
  },
  {
    id: 'posters',
    index: '04',
    title: 'Poster Series',
    category: '3D Visual',
    year: '2024 — 2025',
    client: 'Self-initiated',
    role: 'Design, retouch, 3D',
    tools: ['Photoshop', 'Blender'],
    summary: 'Alternate film posters and automotive studies in dual-tone light.',
    description:
      'An ongoing print series: cinematic photo manipulation, single-source lighting and layouts that carry the whole story in one frame — from Titanic re-imagined to the Shelby in monochrome.',
    cover: { type: 'image', src: '/media/posters/titanic.png', alt: 'Alternate Titanic film poster' },
    tone: '#262229',
    depth: 3,
  },
  {
    id: 'cinematic',
    index: '05',
    title: 'Cinematic Edit',
    category: 'Film / Video',
    year: '2025',
    client: 'Self-initiated',
    role: 'Edit, sound design, grade',
    tools: ['Premiere Pro', 'After Effects', 'DaVinci'],
    summary: 'Beat-matched transitions, custom grade, sound design cut to the frame.',
    description:
      'A short-form cinematic edit engineered around impact: transitions placed on the beat, a grade built from two light sources, and sound design that carries the cut rather than decorating it.',
    cover: { type: 'video', src: '/media/videos/cinematic-edit.mp4', poster: '/media/posters/mustang-cobra.png', alt: 'Cinematic beat-matched edit' },
    tone: '#1F2630',
    depth: 4,
  },
  {
    id: 'experimental',
    index: '06',
    title: 'Signal / Iris',
    category: 'Experimental',
    year: '2026',
    client: 'Studio research',
    role: 'Direction, WebGL, motion',
    tools: ['Three.js', 'GLSL', 'After Effects'],
    summary: 'Ongoing research into distortion, depth and real-time material.',
    description:
      'A running experiment in real-time image making: refraction, displacement and the point where a rendered surface stops reading as a render and starts reading as material.',
    cover: { type: 'video', src: '/media/videos/eye.mp4', poster: '/media/images/wildcraft.png', alt: 'Experimental refraction study' },
    tone: '#1C2321',
    depth: 5,
  },
];

/** The horizontal gallery reuses the same records — never a second copy. */
export const GALLERY_PROJECTS = PROJECTS.slice(0, 4);

export const getProjectById = (id) => PROJECTS.find((project) => project.id === id);
