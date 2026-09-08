import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  The signature scroll transformation.

  The hero is pinned for three extra viewports while one scrubbed timeline
  takes the composition apart: the wordmark parts down the middle, the
  supporting type drifts outward and fades, and the same progress value is
  handed to the 3D scene so the camera flies through the gap the letters open.

  ScrollTrigger earns its place here specifically for the pin — holding a
  section still while scroll drives a sequence, with a spacer sized correctly
  and recalculated on resize, is fiddly to do by hand and trivial here.
*/

/**
 * @param {object} refs         hero DOM element refs to choreograph
 * @param {object} sequenceRef  shared ref the 3D scene samples each frame
 * @param {boolean} enabled     false under reduced motion — no pin, no travel
 */
export function useHeroSequence({ refs, sequenceRef, enabled }) {
  useLayoutEffect(() => {
    if (!enabled) {
      // Reduced motion: the hero is an ordinary screen and the 3D scene
      // stays in its opening composition.
      if (sequenceRef) sequenceRef.current.hero = 0;
      return undefined;
    }

    const { section, titleLeft, titleRight, eyebrow, copy, cta, cue } = refs;
    if (!section.current) return undefined;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=240%",
          pin: true,
          // Pinning adds a spacer; without this the pinned element can jitter
          // by a pixel against smooth scroll on some browsers.
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (sequenceRef) sequenceRef.current.hero = self.progress;
          },
        },
        defaults: { ease: "none" },
      });

      // The wordmark parts down the middle — this is the gap the camera flies
      // through, so it leads and travels furthest.
      timeline
        .to(titleLeft.current, { xPercent: -62, ease: "signature" }, 0)
        .to(titleRight.current, { xPercent: 62, ease: "signature" }, 0)
        // Supporting type moves apart from the centre before it fades, so the
        // whole composition reads as disassembling rather than dimming.
        .to(eyebrow.current, { x: -120, autoAlpha: 0 }, 0)
        .to(copy.current, { x: -80, y: 40, autoAlpha: 0 }, 0)
        .to(cta.current, { x: 80, y: 40, autoAlpha: 0 }, 0)
        .to(cue.current, { autoAlpha: 0 }, 0)
        // The letters clear the frame before the camera reaches the form.
        .to([titleLeft.current, titleRight.current], { autoAlpha: 0 }, 0.35);
    }, section);

    return () => context.revert();
  }, [refs, sequenceRef, enabled]);
}
