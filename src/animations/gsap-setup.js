import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { CSS_EASE, GSAP_EASE } from './easings';

/**
 * GSAP is registered once, here, and the site's easing vocabulary is
 * registered with it so a GSAP timeline and a CSS transition can share the
 * exact same curve.
 */

let registered = false;

export function setupGsap() {
  if (registered) return { gsap, ScrollTrigger };
  registered = true;

  gsap.registerPlugin(ScrollTrigger, CustomEase);

  CustomEase.create(GSAP_EASE.signature, CSS_EASE.signature.replace(/cubic-bezier\(|\)|\s/g, ''));
  CustomEase.create(GSAP_EASE.outExpo, CSS_EASE.outExpo.replace(/cubic-bezier\(|\)|\s/g, ''));
  CustomEase.create(GSAP_EASE.outQuart, CSS_EASE.outQuart.replace(/cubic-bezier\(|\)|\s/g, ''));

  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
