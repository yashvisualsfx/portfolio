# HARSH — Portfolio

A cinematic, scroll-driven 3D portfolio for Harsh, built as one continuous
WebGL experience rather than a stack of sections.

**Stack:** React + Vite · Three.js · React Three Fiber · drei · Motion
(`motion/react`) · GSAP + ScrollTrigger · Lenis

## Getting started

```bash
npm install
npm run dev      # dev server
npm run build    # production build
npm run media    # derive web-ready assets from images/ posters/ videos/
```

## Adding Harsh's work

The project data ships with placeholder slots — no artwork is bundled yet.

1. Drop the originals into `images/`, `posters/` and `videos/` (any of the
   three may be absent). Full-resolution exports are fine; the pipeline
   handles compression.
2. Run `npm run media`. It writes optimized WebP/MP4 into `public/media/` and
   regenerates `src/data/media-manifest.json` with dimensions and blur
   placeholders.
3. Point each `media` slot in `src/data/projects.js` at the generated key —
   a file named `Opening Film.mp4` becomes the key `opening-film`:

   ```js
   media: { type: "video", key: "opening-film" },
   ```

Anything still set to `null` renders its frame without the fill, so the site
composes correctly while artwork is pending.

## Before launch

`src/data/site.js` carries `TODO(harsh)` markers on every contact detail —
email, social links, location, experience. Replace them all.

## Structure

```
src/
├── components/   ui atoms and layout (nav, preloader, cursor)
├── sections/     one file per scroll scene
├── three/        the single persistent WebGL canvas and its scenes
├── animations/   shared easing, variants and scroll integration
├── hooks/        reduced motion, touch, pointer and scroll inputs
├── data/         projects, skills, site config, media manifest
└── styles/       design tokens, typography scale, layout primitives
```
