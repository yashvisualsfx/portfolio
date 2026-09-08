import { useEffect, useRef, useState } from "react";

/**
 * Drives the preloader from real work rather than a fake timer: it waits on
 * the fonts the display type depends on plus the images the first screens
 * need, and reports progress as they land.
 *
 * `minDuration` keeps the loader on screen long enough to read as a deliberate
 * opening rather than a flash on a warm cache.
 */
export function useAssetLoader(sources = [], { minDuration = 1600 } = {}) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    let cancelled = false;

    // Fonts count as one unit of work alongside each image — the display type
    // is a load-bearing part of the design, so revealing before it resolves
    // would show the fallback face.
    const totalUnits = sources.length + 1;
    let doneUnits = 0;

    const advance = () => {
      if (cancelled) return;
      doneUnits += 1;
      setProgress(doneUnits / totalUnits);
    };

    const loadImage = (src) =>
      new Promise((resolve) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve; // a missing asset must never trap the loader
        image.src = src;
      });

    const fonts = document.fonts?.ready ?? Promise.resolve();

    const work = [
      fonts.then(advance),
      ...sources.map((src) => loadImage(src).then(advance)),
    ];

    Promise.all(work).then(() => {
      if (cancelled) return;
      const elapsed = performance.now() - startedAt.current;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        if (cancelled) return;
        setProgress(1);
        setReady(true);
      }, wait);
    });

    return () => {
      cancelled = true;
    };
    // `sources` is a module-level constant list at every call site; re-running
    // on identity change would restart the loader mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDuration]);

  return { progress, ready };
}
