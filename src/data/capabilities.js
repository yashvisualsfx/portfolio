/**
 * What I Do — rendered as an oversized interactive type list, never cards.
 * `preview` is the media that fades in beside the cursor on hover.
 */

import { asset } from './asset';

export const CAPABILITIES = [
  {
    id: 'creative-direction',
    index: '01',
    title: 'Creative Direction',
    note: 'Concept, art direction, visual systems',
    preview: { src: asset('/media/posters/lv-watch@sm.webp'), alt: 'Luxury product art direction' },
  },
  {
    id: 'graphic-design',
    index: '02',
    title: 'Graphic Design',
    note: 'Campaign key visuals, print, layout',
    preview: { src: asset('/media/images/nike@sm.webp'), alt: 'Campaign key visual design' },
  },
  {
    id: 'motion-design',
    index: '03',
    title: 'Motion Design',
    note: 'Type choreography, product motion, titles',
    preview: { src: asset('/media/images/realme@sm.webp'), alt: 'Product motion design frame' },
  },
  {
    id: 'video-editing',
    index: '04',
    title: 'Video Editing',
    note: 'Story edit, pacing, grade, sound design',
    preview: { src: asset('/media/posters/mustang-cobra@sm.webp'), alt: 'Cinematic edit still' },
  },
  {
    id: 'ui-ux',
    index: '05',
    title: 'UI / UX',
    note: 'Interface systems, interaction, prototypes',
    preview: { src: asset('/media/images/wildcraft@sm.webp'), alt: 'Interface and layout study' },
  },
  {
    id: '3d',
    index: '06',
    title: '3D Experiences',
    note: 'Real-time WebGL, lighting, material studies',
    preview: { src: asset('/media/posters/titanic@sm.webp'), alt: '3D lighting study' },
  },
  {
    id: 'brand-identity',
    index: '07',
    title: 'Brand Identity',
    note: 'Marks, type systems, guidelines',
    preview: { src: asset('/media/posters/mustang-gt@sm.webp'), alt: 'Brand identity application' },
  },
];
