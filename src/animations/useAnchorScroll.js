import { useEffect } from "react";

/**
 * Routes in-page anchor clicks through Lenis.
 *
 * Without this the browser jumps instantly to the target while Lenis is still
 * interpolating, which fights the smooth scroll and lands the page in the
 * wrong place. Delegated from the document so it covers every link in the
 * site, including ones later phases add.
 */
export function useAnchorScroll(lenisRef) {
  useEffect(() => {
    const onClick = (event) => {
      // Let modified clicks (new tab, download, etc.) behave normally.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      const lenis = lenisRef.current;
      event.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: 0, duration: 1.6 });
      } else {
        // Lenis is off (reduced motion) — native scroll honours the user's
        // own scroll-behavior preference.
        target.scrollIntoView();
      }

      // Keep the URL and focus in sync so the jump is real for keyboard and
      // screen-reader users, not just visual.
      window.history.pushState(null, "", hash);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenisRef]);
}
