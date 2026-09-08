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

## Deploying to Vercel

`vercel.json` is already configured — Vite preset, SPA rewrites, and two
different cache policies, because the build emits two different kinds of file:
Vite's hashed `/assets/*` are safe to cache forever (a change produces a new
filename), while `/media/*` keeps its original names, so replacing an asset
would otherwise serve a stale one. Media revalidates daily instead.

Easiest route — import from GitHub:

1. vercel.com → **Add New… → Project** → import this repository.
2. Pick the branch (`claude/harsh-3d-portfolio-site-sm0fyj`, or merge to
   `main` first). Everything else is detected from `vercel.json`; no build
   settings or environment variables to fill in.
3. **Deploy.** Roughly a minute.

Or from a terminal with the repo checked out:

```bash
npx vercel          # preview deployment
npx vercel --prod   # production
```

The first run asks you to log in and link the project.

Note that `public/media/` (~21MB of optimized video and stills) is committed
and ships with the build, so nothing needs uploading separately.

## Still to fill in

`src/data/site.js` carries a `TODO(harsh)` on the experience line, and Behance
has no URL yet — channels without one are marked `pending` and simply aren't
rendered, so nothing ships pointing nowhere. Add the URL and it appears on its
own.

In `src/data/projects.js`, every piece still says `Client TBC` / `Channel TBC`,
and the Documentary category is empty and pending.

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
