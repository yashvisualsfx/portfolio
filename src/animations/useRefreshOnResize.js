import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  ScrollTrigger measures pin distances and end positions once. Anything that
  changes layout after that — a resize, a font swapping in, lazily loaded
  media finally reserving its height — leaves those measurements stale, and
  stale measurements are what make a pinned section end in the wrong place.

  Mobile browsers make this worse: the URL bar collapsing fires `resize` on
  every scroll direction change, so refreshing on the raw event would thrash.
  Width-only comparison ignores it, and a ResizeObserver on the body catches
  the content-height changes that a resize event never reports.
*/
export function useRefreshOnResize() {
  useEffect(() => {
    let width = window.innerWidth;
    let timer;

    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    };

    const onResize = () => {
      if (window.innerWidth === width) return; // vertical-only: URL bar
      width = window.innerWidth;
      refresh();
    };

    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);

    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);
}
