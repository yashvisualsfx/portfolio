import { useCallback, useEffect, useState } from "react";

/*
  Theme resolution, in priority order:

    1. an explicit choice the visitor has made, persisted
    2. their operating system preference
    3. dark — the design's home key

  The choice is stored rather than the resolved value, so someone who has
  never toggled keeps following their system as it changes (including
  mid-session), while someone who has chosen keeps their choice.
*/

const STORAGE_KEY = "harsh-theme";
const QUERY = "(prefers-color-scheme: light)";

function systemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia(QUERY).matches ? "light" : "dark";
}

function storedChoice() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    // Private browsing and blocked storage both throw; falling back to the
    // system preference is strictly better than failing to render.
    return null;
  }
}

export function useTheme() {
  const [choice, setChoice] = useState(storedChoice);
  const [system, setSystem] = useState(systemTheme);

  const theme = choice ?? system;

  // Follow the system while no explicit choice has been made.
  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (event) => setSystem(event.matches ? "light" : "dark");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    // Tells the browser which scrollbar and form-control palette to use, so
    // native UI doesn't stay dark on a light page.
    root.style.colorScheme = theme;

    // Keep the mobile browser chrome in step with the page.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f4f2ed" : "#0a0a0a");
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setChoice((current) => {
      const next = (current ?? systemTheme()) === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Non-fatal: the theme still applies for this session.
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
