/**
 * MEDIA PIPELINE
 *
 * `media-source/` holds the masters, at whatever size they were exported.
 * `public/media/` holds only what ships. Nothing in media-source is ever
 * served, bundled or copied into dist.
 *
 * Run after adding or replacing a master:  npm run media
 *
 *   stills → webp at 1920 and 1024 (the @sm variant is what WebGL textures
 *            and hover previews use; neither needs more)
 *   reels  → 14-second h264 loops at 1280, 24fps, no audio track, plus a
 *            webp poster so nothing ever downloads video to show something
 */

import sharp from 'sharp';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readdir, mkdir, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'media-source');
const OUT = path.join(root, 'public/media');

const STILL_SIZES = [
  { suffix: '', width: 1920 },
  { suffix: '@sm', width: 1024 },
];

const REEL_SECONDS = 14;
const REEL_WIDTH = 1280;

async function stills(dir) {
  await mkdir(path.join(OUT, dir), { recursive: true });
  const files = await readdir(path.join(SRC, dir));
  for (const file of files) {
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const base = file.replace(/\.[^.]+$/, '');
    for (const size of STILL_SIZES) {
      const info = await sharp(path.join(SRC, dir, file))
        .resize({ width: size.width, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 82, effort: 5 })
        .toFile(path.join(OUT, dir, `${base}${size.suffix}.webp`));
      console.log(`${dir}/${base}${size.suffix}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
    }
  }
}

async function reels() {
  const dir = 'videos';
  await mkdir(path.join(OUT, dir), { recursive: true });
  const files = await readdir(path.join(SRC, dir));
  for (const file of files) {
    if (!/\.(mp4|mov|webm)$/i.test(file)) continue;
    const from = path.join(SRC, dir, file);
    const base = file.replace(/\.[^.]+$/, '');

    await run(ffmpeg, [
      '-y', '-i', from,
      '-t', String(REEL_SECONDS),
      '-an',
      '-vf', `scale='min(${REEL_WIDTH},iw)':-2:flags=lanczos,fps=24`,
      '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
      '-crf', '30', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      path.join(OUT, dir, `${base}.mp4`),
    ]);

    await run(ffmpeg, [
      '-y', '-ss', '1', '-i', from,
      '-frames:v', '1',
      '-vf', `scale='min(${REEL_WIDTH},iw)':-2:flags=lanczos`,
      '-c:v', 'libwebp', '-quality', '80',
      path.join(OUT, dir, `${base}-poster.webp`),
    ]);

    const size = (await stat(path.join(OUT, dir, `${base}.mp4`))).size;
    console.log(`${dir}/${base}.mp4  ${(size / 1048576).toFixed(1)}MB`);
  }
}

if (process.argv.includes('--clean')) await rm(OUT, { recursive: true, force: true });
await stills('images');
await stills('posters');
await reels();
console.log('\nmedia pipeline complete');
