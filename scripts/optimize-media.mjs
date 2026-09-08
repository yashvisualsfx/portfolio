/*
  Media pipeline.

  Drop Harsh's originals into images/, posters/ and videos/ (any of the three
  may be absent), then run `npm run media`. Design-tool and camera exports are
  far too heavy to ship as-is, so this derives web-ready versions into
  public/media/ — WebP stills capped at 1800px, H.264 capped at 1280px and
  30fps — and writes a manifest carrying intrinsic dimensions plus a tiny blur
  placeholder for each asset, so components can reserve aspect-ratio space (no
  layout shift) and blur up during the cinematic image reveals.

  Each output is named after its source file, slugified: "Opening Film.mp4"
  becomes the manifest key "opening-film". Point a project's `media` slot in
  src/data/projects.js at that key to wire it into the site.

  Run with: npm run media
  Outputs are committed, so the site builds without re-running this.
*/

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const run = promisify(execFile);
const FFMPEG = ffmpegInstaller.path;

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "media");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "media-manifest.json");

const IMAGE_SOURCES = ["images", "posters"];
const VIDEO_SOURCES = ["videos"];

// Longest edge caps. Stills stay large enough for fullscreen art direction;
// video is capped at 1280 because it only ever plays inside a panel.
const IMAGE_MAX_EDGE = 1800;
const VIDEO_MAX_EDGE = 1280;
const VIDEO_CRF = 28;
// Several sources are 50–60fps. Halving to 30 roughly halves the bitrate for
// no perceptible loss in a panel-sized autoplay loop.
const VIDEO_MAX_FPS = 30;

/** Normalizes "Opening Film 02.mp4" -> "opening-film-02" */
function slugify(filename) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function isStale(source, output) {
  try {
    const [src, out] = await Promise.all([stat(source), stat(output)]);
    return src.mtimeMs > out.mtimeMs;
  } catch {
    return true; // output missing
  }
}

async function optimizeImage(source, slug) {
  const outPath = path.join(OUT_DIR, `${slug}.webp`);
  const image = sharp(source, { limitInputPixels: false });
  const meta = await image.metadata();

  if (await isStale(source, outPath)) {
    await image
      .clone()
      .resize({
        width: meta.width >= meta.height ? IMAGE_MAX_EDGE : null,
        height: meta.width >= meta.height ? null : IMAGE_MAX_EDGE,
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: 80, effort: 5 })
      .toFile(outPath);
    console.log(`image  ✓ ${slug}.webp`);
  } else {
    console.log(`image  · ${slug}.webp (up to date)`);
  }

  // Tiny blur placeholder inlined into the manifest.
  const lqip = await sharp(source, { limitInputPixels: false })
    .resize({ width: 20, fit: "inside" })
    .webp({ quality: 30 })
    .toBuffer();

  const out = await sharp(outPath).metadata();
  return {
    src: `/media/${slug}.webp`,
    width: out.width,
    height: out.height,
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
  };
}

async function optimizeVideo(source, slug) {
  const outPath = path.join(OUT_DIR, `${slug}.mp4`);
  const posterPath = path.join(OUT_DIR, `${slug}-poster.webp`);

  // Cap the longest edge at VIDEO_MAX_EDGE, keep dimensions even for h264.
  const scale =
    `scale='if(gte(iw,ih),min(${VIDEO_MAX_EDGE},iw),-2)':` +
    `'if(gte(iw,ih),-2,min(${VIDEO_MAX_EDGE},ih))'`;

  if (await isStale(source, outPath)) {
    await run(FFMPEG, [
      "-y",
      "-i", source,
      "-vf", scale,
      "-r", String(VIDEO_MAX_FPS),
      "-c:v", "libx264",
      "-profile:v", "high",
      "-crf", String(VIDEO_CRF),
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "96k",
      "-movflags", "+faststart",
      outPath,
    ]);
    console.log(`video  ✓ ${slug}.mp4`);
  } else {
    console.log(`video  · ${slug}.mp4 (up to date)`);
  }

  if (await isStale(source, posterPath)) {
    const framePath = path.join(OUT_DIR, `${slug}-frame.png`);
    // Grab a frame a little way in — frame 0 is often black on edited footage.
    await run(FFMPEG, ["-y", "-ss", "0.6", "-i", outPath, "-frames:v", "1", framePath]);
    await sharp(framePath).webp({ quality: 72 }).toFile(posterPath);
    await run("rm", ["-f", framePath]);
    console.log(`poster ✓ ${slug}-poster.webp`);
  }

  const poster = await sharp(posterPath).metadata();
  const lqip = await sharp(posterPath)
    .resize({ width: 20, fit: "inside" })
    .webp({ quality: 30 })
    .toBuffer();

  return {
    src: `/media/${slug}.mp4`,
    poster: `/media/${slug}-poster.webp`,
    width: poster.width,
    height: poster.height,
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
  };
}

/** Source folders are optional — an absent one just contributes nothing. */
async function listSource(dir) {
  try {
    return (await readdir(path.join(ROOT, dir))).sort();
  } catch {
    return [];
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = {};

  for (const dir of IMAGE_SOURCES) {
    for (const file of await listSource(dir)) {
      if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
      const slug = slugify(file);
      // Two sources that slugify identically (a name differing only by case,
      // say) would overwrite each other — first one wins.
      if (manifest[slug]) continue;
      manifest[slug] = await optimizeImage(path.join(ROOT, dir, file), slug);
    }
  }

  for (const dir of VIDEO_SOURCES) {
    for (const file of await listSource(dir)) {
      if (!/\.(mp4|mov|webm)$/i.test(file)) continue;
      const slug = slugify(file);
      manifest[slug] = await optimizeVideo(path.join(ROOT, dir, file), slug);
    }
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const count = Object.keys(manifest).length;
  console.log(`\nmanifest → ${path.relative(ROOT, MANIFEST_PATH)} (${count} assets)`);
  if (count === 0) {
    console.log("no sources found — add files to images/, posters/ or videos/ and re-run");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
