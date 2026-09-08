import { useEffect, useState } from "react";

const QUERY = "(hover: none), (pointer: coarse)";

// Gates desktop-only interactions (custom cursor, hover-driven 3D previews).
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (event) => setIsTouch(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
