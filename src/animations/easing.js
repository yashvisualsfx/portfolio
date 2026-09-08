// Shared motion language — one signature curve used everywhere (Framer
// Motion/CSS transitions, GSAP timelines, R3F lerps) so every transition in
// the site feels like it belongs to the same composition.

export const EASE_SIGNATURE = [0.76, 0, 0.24, 1];
export const EASE_SIGNATURE_CSS = "cubic-bezier(0.76, 0, 0.24, 1)";
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.2,
};

// Minimal cubic-bezier solver (mirrors the CSS timing-function algorithm)
// so GSAP timelines can use the exact same curve as CSS/Framer Motion
// without pulling in the paid CustomEase plugin.
function cubicBezier(x1, y1, x2, y2) {
  const a = (a1, a2) => 1 - 3 * a2 + 3 * a1;
  const b = (a1, a2) => 3 * a2 - 6 * a1;
  const c = (a1) => 3 * a1;

  const bezierX = (t) => ((a(x1, x2) * t + b(x1, x2)) * t + c(x1)) * t;
  const bezierY = (t) => ((a(y1, y2) * t + b(y1, y2)) * t + c(y1)) * t;
  const derivativeX = (t) => 3 * a(x1, x2) * t * t + 2 * b(x1, x2) * t + c(x1);

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = bezierX(t) - x;
      const derivative = derivativeX(t);
      if (Math.abs(derivative) < 1e-6) break;
      t -= dx / derivative;
    }
    return bezierY(t);
  };
}

// Registers the signature curve with a GSAP instance under the name
// "signature" so timelines elsewhere can write `ease: "signature"` instead
// of repeating the bezier literal.
export function registerGsapEasing(gsap) {
  gsap.registerEase("signature", cubicBezier(...EASE_SIGNATURE));
  gsap.registerEase("signatureOutExpo", cubicBezier(...EASE_OUT_EXPO));
}
