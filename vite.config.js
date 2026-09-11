import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Media in /public is served as-is. Large source media (videos) is intentionally
// kept out of the bundle graph so it can be streamed and lazily requested.
// `BASE_PATH` lets the same build serve from a domain root or from a
// subpath (a GitHub Pages project site lives at /<repo>/). Everything that
// resolves a URL at runtime goes through `import.meta.env.BASE_URL`, which
// Vite sets from this value.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Keep the WebGL runtime in its own chunk: it is the heaviest dependency
        // and must be cacheable/splittable away from the first paint.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('three') || id.includes('@react-three')) return 'webgl';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
});
