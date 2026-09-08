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

      /*
        Every tween declares its own start value and defers rendering.

        A plain `.to()` would record whatever was on screen when the timeline
        was built — and this timeline is built the moment the intro begins,
        while Motion still has the supporting type at opacity 0 mid-fade. GSAP
        would capture that 0 as the start of a scrubbed tween and hold it
        there, so the eyebrow, copy and CTA never appeared at all.

        `fromTo` states the intended start explicitly, and
        `immediateRender: false` stops GSAP writing those values before the
        first scroll — which leaves Motion owning the intro and GSAP taking
        over only once the sequence actually moves.
      */
      const deferred = { immediateRender: false };

      // The wordmark parts down the middle — this is the gap the camera flies
      // through, so it leads and travels furthest.
      timeline
        .fromTo(titleLeft.current, { xPercent: 0 }, { xPercent: -62, ease: "signature", ...deferred }, 0)
        .fromTo(titleRight.current, { xPercent: 0 }, { xPercent: 62, ease: "signature", ...deferred }, 0)
        // Supporting type moves apart from the centre before it fades, so the
        // whole composition reads as disassembling rather than dimming.
        .fromTo(eyebrow.current, { x: 0, autoAlpha: 1 }, { x: -120, autoAlpha: 0, ...deferred }, 0)
        .fromTo(copy.current, { x: 0, y: 0, autoAlpha: 1 }, { x: -80, y: 40, autoAlpha: 0, ...deferred }, 0)
        .fromTo(cta.current, { x: 0, y: 0, autoAlpha: 1 }, { x: 80, y: 40, autoAlpha: 0, ...deferred }, 0)
        .fromTo(cue.current, { autoAlpha: 1 }, { autoAlpha: 0, ...deferred }, 0)
        // The letters clear the frame before the camera reaches the form.
        .fromTo(
          [titleLeft.current, titleRight.current],
          { autoAlpha: 1 },
          { autoAlpha: 0, ...deferred },
          0.35,
        );
    }, section);

    return () => context.revert();
  }, [refs, sequenceRef, enabled]);
}
