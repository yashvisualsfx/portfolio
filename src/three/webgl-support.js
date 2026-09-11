let cached = null;

/**
 * Whether this browser can give us a WebGL2 context at all. Checked once;
 * if it cannot, the site runs as a typographic experience with no canvas
 * rather than failing to boot.
 */
export function hasWebGL() {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = Boolean(
      window.WebGL2RenderingContext && canvas.getContext('webgl2'),
    );
  } catch {
    cached = false;
  }
  return cached;
}
