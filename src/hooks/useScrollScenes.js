import { useEffect } from 'react';
import { setupGsap, ScrollTrigger } from '../animations/gsap-setup';
import { setSceneProgress, scroll } from '../animations/scroll-state';
import { setSectionRanges } from '../three/camera-path';
import { clamp } from '../animations/easings';

/**
 * Binds the DOM to the camera journey.
 *
 * Every element carrying `data-scene` publishes two things: its own 0 → 1
 * progress (used by the scenes for local choreography) and its range in
 * global scroll progress (used by the camera to know where in the corridor
 * it should be).
 *
 * Measuring the real elements — rather than hard-coding fractions — is what
 * keeps the camera locked to the type it is moving past when a section's
 * height changes with the viewport, the font or the content.
 */
export function useScrollScenes(deps = []) {
  useEffect(() => {
    setupGsap();

    const elements = [...document.querySelectorAll('[data-scene]')];
    if (elements.length === 0) return undefined;

    const measure = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      if (limit <= 0) return;
      setSectionRanges(
        elements.map((element) => {
          const top = element.offsetTop;
          return {
            id: element.dataset.scene,
            start: clamp(top / limit),
            end: clamp((top + element.offsetHeight) / limit),
          };
        }),
      );
    };

    const triggers = elements.map((element) =>
      ScrollTrigger.create({
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => setSceneProgress(element.dataset.scene, self.progress),
        onRefresh: measure,
      }),
    );

    measure();
    ScrollTrigger.refresh();

    // Height changes with fonts, images and viewport; re-measure rather than
    // trusting the first reading.
    const observer = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      triggers.forEach((trigger) => trigger.kill());
      scroll.scenes = Object.create(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
