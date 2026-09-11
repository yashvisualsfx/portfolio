# HARSH — Creative Designer

A cinematic, scroll-driven 3D portfolio. One persistent WebGL scene sits
behind an editorial typographic layer, and scrolling drives the camera, the
objects, the lighting and the type reveals as a single composition rather
than as a stack of independent sections.

**Stack** — React 19 · Vite 7 · Three.js · React Three Fiber · drei · Motion ·
GSAP + ScrollTrigger · Lenis.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle → dist/
npm run preview  # serve the built bundle
npm run lint
npm run media    # re-encode media-source/ → public/media/
```

## The idea

The whole site is **one corridor in Z**. Every scene is built at its own
depth and the camera only ever travels forward through it:

```
   +9 ───── 0 ────── -14 … -54 ───── -70 ── -96 ─── -120 ── -130
 start   monolith    the six projects  gallery orbit statement finale
```

Because the path is continuous by construction, no transition between
sections has to be choreographed as a cut — the camera simply arrives. The
camera poses form a chain in which each section starts exactly where the last
one ended (`src/three/camera-path.js`), so a seam cannot open up between two
sections without someone deliberately putting one there.

The form follows the same logic. A stack of chamfered slabs reads as one
sculptural object in the hero, opens into a corridor the camera flies
through, returns as the bar the closing statement straddles, and re-forms
into itself behind the contact section. It is one object, seen four times.

## Architecture

```
src/
├── main.jsx                  entry — global stylesheet first, then the app
├── App.jsx                   composition only: providers, layers, section order
│
├── styles/                   the design system, in cascade order
│   ├── fonts.css             self-hosted variable faces
│   ├── tokens.css            colour · type scale · spacing · grid · motion · z
│   ├── base.css              reset, ground, focus, scroll lock, cursor mode
│   ├── typography.css        the scale as classes + the mask-reveal primitive
│   ├── layout.css            container · section rhythm · depth layers · grade
│   └── index.css             the one import graph
│
├── components/
│   ├── layout/               Container · Section · SceneSection · SkipLink
│   ├── typography/           Text · MaskLine · SplitWord · Reveal
│   └── ui/                   Navigation · Menu · Cursor · Media · Marquee
│                             ActionLink · ScrollCue · ProjectDetail
│
├── sections/                 one file per scroll scene, 01 → 10
├── three/
│   ├── Stage.jsx             the one canvas, lazy-loaded
│   ├── SceneRoot.jsx         everything inside it
│   ├── camera-path.js        the journey, and per-section presence
│   ├── Lighting.jsx          a built environment, not a downloaded one
│   ├── rig/CameraRig.jsx     damping + viewport-shape compensation
│   └── scenes/               Monolith · Gallery · OrbitForm · StatementBar
│                             Finale · Dust · slabs.js (the shared form)
│
├── animations/
│   ├── easings.js            curves, durations, staggers, lerp/damp/mapRange
│   ├── variants.js           reusable Motion variants + reduced-motion fallbacks
│   ├── gsap-setup.js         one registration, the site's eases as GSAP eases
│   ├── scroll-state.js       mutable scroll state, read by the render loop
│   ├── reveal-sweeper.js     the safety net under every scroll reveal
│   └── useScrollChoreography.js  scrubbed timelines that fully revert
│
├── hooks/                    useMediaQuery · useReducedMotion · useScrollLock
│                             useDeviceProfile · useSmoothScroll ·
│                             useScrollScenes · useRevealed · useLoadProgress
├── context/                  AppProvider — device, motion, boot phase, menu
└── data/                     site · projects · capabilities · about
```

### Principles

- **Tokens, not values.** No component hard-codes a colour, a size, a duration
  or an easing. Retuning the site is a `tokens.css` edit.
- **Roles, not sizes.** Sections ask for `<Text variant="display">`, never a
  font size, so the scale can move globally.
- **One animation vocabulary.** Every reveal comes from `variants.js` and
  every curve from `easings.js` — CSS, Motion and GSAP share them.
- **Scroll and pointer never re-render React.** Both live in mutable modules
  the render loop reads. At 120Hz, routing a parallax tilt through state
  would reconcile the tree 120 times a second.
- **One capability check.** `useDeviceProfile()` is the only place the site
  decides breakpoint, pointer type, render tier and DPR cap.
- **Reduced motion is a mode, not a switch.** Variants return fades, the flag
  is mirrored to `<html data-motion>` for CSS, Lenis is not started at all
  (inertia is the thing people turn off), and the custom cursor is not
  mounted.
- **App.jsx assembles, nothing else.**

### Depth layering

`.content` deliberately creates no stacking context, so its children sit on
either side of the canvas in the root stacking order:

```
.layer-behind   z-index -1   type the 3D form passes in front of
.stage          z-index  0   the one canvas
.grade          z-index  1   vignette and grain
.layer-front    z-index  1   type and interface in front of the form
```

Two consequences worth knowing before editing anything here:

- The ground colour lives on `<html>`, not `<body>`. A painted body
  background covers negative z-index content.
- `position: sticky` always forms a stacking context, so a section that needs
  type on both sides of the canvas uses **two sticky siblings**, not two
  spans inside one sticky block (see `Break.jsx`, `Statement.jsx`).
- `<body>` carries no `overflow`. `overflow-x: hidden` there computes
  `overflow-y` to `auto`, which turns the body into a scroll container that
  never scrolls — and silently disables sticky positioning for the whole
  page. Horizontal bleed is clipped by `overflow-x: clip` on `<html>`.

## Performance

- The WebGL runtime is lazy-loaded and split into its own chunk, so the
  preloader, the type and the layout all paint while three.js is arriving.
- One canvas for the whole session. Scenes are built once at their own depth
  and travelled past, never created or destroyed on scroll.
- Resolution is the quality dial: drei's `PerformanceMonitor` steps DPR down
  when measured frame time declines, and the loop is paused outright while a
  fullscreen dialog covers the canvas.
- The environment is rendered once into a cube target from emissive planes —
  no HDR fetch, no per-frame cost.
- Scene presence is derived from measured section ranges, not camera
  distance: the camera's actual position varies with the viewport's shape.
- Media: stills always paint first; a reel's `src` is attached only when its
  frame is genuinely active, and never on a metered connection.
- Mobile gets fewer slabs, fewer points, no antialiasing, a lower DPR cap,
  no custom cursor, and a camera pulled back to compensate for a portrait
  viewport's much narrower horizontal field of view.

## Media pipeline

`media-source/` holds the masters; `public/media/` holds only what ships.
Nothing in `media-source/` is served, bundled or copied into `dist`.

```bash
npm run media
```

Stills become webp at 1920 and 1024 (the `@sm` variant is what WebGL textures
and hover previews use); reels become 14-second h264 loops at 1280, 24fps,
with no audio track and a webp poster. 258 MB of masters → 14 MB shipped.

## Accessibility

Semantic landmarks and a single H1; the skip link is the first tab stop;
menu and project view are real dialogs with focus trapping, Escape, and focus
returned to their trigger; visible focus rings everywhere; every image has
alt text; split and masked headings carry a screen-reader copy of their text
so a two-line heading is never announced as one run-on word; and
`prefers-reduced-motion` is honoured across CSS, Motion, GSAP, Lenis and the
3D layer.

Scroll reveals have a safety net (`reveal-sweeper.js`): IntersectionObserver
reports threshold *crossings*, so an element the viewport jumps straight past
— via an anchor link, a restored scroll position or an assistive tool moving
focus — would otherwise stay hidden forever. A shared, rAF-throttled sweep
reveals anything already scrolled past.

## Verification

Each phase was checked before the next began, and the whole site again at the
end: lint clean, production build clean, no console errors, no horizontal
overflow at 390 / 768 / 1440, nothing stranded invisible after a full scroll
pass in either motion mode, and a working fallback when WebGL is unavailable.

## Deployment

Deployed on **Vercel**. The repo carries everything Vercel needs, so importing
it requires no configuration:

- `vercel.json` — framework, build and install commands, output directory,
  cache headers and security headers
- `.vercelignore` — keeps `media-source/` (259 MB of masters) out of uploads
- `engines.node` — pins the runtime to Node 22, matching local

**To connect it:** vercel.com → Add New → Project → import
`yashvisualsfx/portfolio` → Deploy. Set the production branch under Settings →
Git. Every push to that branch then deploys, and every other branch gets a
preview URL.

### Caching

Only content-hashed files are cached immutably, because only they can be:

| Path | Policy | Why |
| --- | --- | --- |
| `/assets/*` | `max-age=31536000, immutable` | Hashed filenames — the content behind a given URL can never change |
| `/fonts/*`, `/media/*` | `max-age=86400, stale-while-revalidate=604800` | Stable filenames. A day of freshness, then served stale while revalidating, so replacing an image shows up quickly without costing repeat visitors a round trip |

### Base path

The build is base-portable: `BASE_PATH` sets Vite's base, and everything that
resolves a URL at runtime goes through `data/asset.js`, which prefixes
`import.meta.env.BASE_URL`. On Vercel the base is `/` and this costs nothing,
but it means the same build also works from a subpath. Use `asset()` for any
new media path — Vite rebases what it can see (imports, CSS `url()`,
attributes in index.html), but a path that exists only as a string in a data
file is invisible to it, and those are most of this site's media.

To reproduce a subpath build locally:

```bash
BASE_PATH=/portfolio/ npm run build
BASE_PATH=/portfolio/ npm run preview
```

## `legacy/`

The previous single-file Tailwind portfolio is preserved at
`legacy/index.html` for reference. It is excluded from the build and lint.
