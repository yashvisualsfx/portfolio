# HARSH — Creative Designer

A cinematic, scroll-driven 3D portfolio. One continuous WebGL scene sits behind
an editorial typographic layer; scrolling drives the camera, the objects, the
lighting and the type reveals as a single composition rather than a stack of
independent sections.

**Stack** — React 19 · Vite 7 · Three.js · React Three Fiber · drei · Motion ·
GSAP + ScrollTrigger · Lenis.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle → dist/
npm run preview  # serve the built bundle
npm run lint
```

## Architecture

```
src/
├── main.jsx                 entry — mounts <App/> and the global stylesheet
├── App.jsx                  composition only: providers, layers, section order
│
├── styles/                  the design system, in cascade order
│   ├── fonts.css            self-hosted variable faces (Archivo, JetBrains Mono)
│   ├── tokens.css           colour, type scale, spacing, layout, motion, z-layers
│   ├── base.css             reset, document ground, focus, scroll lock, cursor
│   ├── typography.css       the type scale as classes + the mask-reveal primitive
│   ├── layout.css           container, editorial grid, section rhythm, layers
│   └── index.css            the single import graph
│
├── components/
│   ├── layout/              Container · Grid/Col · Section · SkipLink
│   ├── typography/          Text (the scale) · MaskLine · Reveal
│   └── ui/                  buttons, cursor, marquee            [phases 3 / 9]
│
├── sections/                one file per scroll scene            [phases 3 – 8]
├── three/                   persistent canvas, scenes, materials [phases 4 – 7]
│
├── animations/
│   ├── easings.js           curves, durations, staggers, lerp/damp/mapRange
│   └── variants.js          reusable Motion variants + reduced-motion fallbacks
│
├── hooks/                   useMediaQuery · useReducedMotion · useScrollLock
│                            useDeviceProfile · useApp
├── context/                 AppProvider — device, motion, boot phase, menu
├── data/                    site · projects · capabilities · about
└── dev/                     Foundation.jsx — the phase-2 specimen page
```

### Principles

- **Tokens, not values.** No component hard-codes a colour, a size, a duration
  or an easing. Retuning the site is a tokens.css edit.
- **Roles, not sizes.** Sections ask for `<Text variant="display">`, never a
  font size, so the scale can move globally.
- **One animation vocabulary.** Every reveal comes from `animations/variants.js`
  and every curve from `animations/easings.js` — CSS, Motion and GSAP share them.
- **Reduced motion is a mode, not a switch.** Variants return fades, the flag is
  mirrored to `<html data-motion>` for CSS, and scroll-triggered reveals are
  promoted to on-mount fades so content can never be stranded hidden.
- **One capability check.** `useDeviceProfile()` is the only place the site
  decides breakpoint, pointer type, render tier and DPR cap.
- **App.jsx assembles, nothing else.** Layers are explicit: `.stage` (WebGL) →
  `.content` (scrolling DOM) → overlays.

### Media

Source media lives in `public/media/{images,posters,videos}` and is requested
lazily. It is currently uncompressed (~260 MB); compression to web-scale
`webp`/`avif` stills and `h264`/`webm` proxies is scheduled for phase 10.

## Build phases

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Vite + React + dependencies | ✅ |
| 2 | Design system, typography, layout, responsive foundation | ✅ |
| 3 | Preloader, navigation, hero | — |
| 4 | Persistent Three.js canvas + hero scene | — |
| 5 | Scroll progress → camera / object transforms | — |
| 6 | Selected Work + horizontal gallery | — |
| 7 | Capabilities, About, experimental break | — |
| 8 | Contact + fullscreen navigation | — |
| 9 | Custom cursor, micro-interactions, transitions | — |
| 10 | Performance and responsive polish | — |

Each phase is verified before the next begins: lint clean, production build
clean, no console errors, and no horizontal overflow at 390 / 768 / 1440 px.

## `legacy/`

The previous single-file Tailwind portfolio is preserved at `legacy/index.html`
for reference. It is excluded from the build and from linting.
