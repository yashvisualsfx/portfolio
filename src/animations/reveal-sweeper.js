/**
 * The safety net under every scroll reveal.
 *
 * IntersectionObserver reports threshold *crossings*. If the page jumps —
 * an anchor link, a restored scroll position, a hard flick on a trackpad, an
 * assistive tool moving focus — an element can go from below the viewport to
 * above it without ever being intersecting on a sampled frame. No crossing is
 * reported, and the element stays hidden forever, below content the visitor
 * has already scrolled past.
 *
 * So: one shared, rAF-throttled sweep that reveals anything the viewport has
 * already gone past. One listener for the whole site, and each element
 * removes itself the moment it is revealed.
 */

const pending = new Set();
let bound = false;
let queued = false;

function sweep() {
  queued = false;
  for (const entry of pending) {
    // Fully above the viewport: it has been passed and must be visible.
    if (entry.element.getBoundingClientRect().bottom < 0) {
      pending.delete(entry);
      entry.reveal();
    }
  }
  if (pending.size === 0) unbind();
}

function onScroll() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(sweep);
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener('scroll', onScroll, { passive: true });
}

function unbind() {
  if (!bound) return;
  bound = false;
  window.removeEventListener('scroll', onScroll);
}

export function watchForPass(element, reveal) {
  const entry = { element, reveal };
  pending.add(entry);
  bind();
  return () => {
    pending.delete(entry);
    if (pending.size === 0) unbind();
  };
}
