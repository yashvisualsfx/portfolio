/**
 * Site-wide copy and configuration. Sections import from here; no section
 * hard-codes a name, a handle or a label.
 */

export const SITE = {
  name: 'HARSH',
  role: 'Creative Designer',
  tagline: 'Building visual experiences through design, motion & technology.',
  location: 'Gurugram, India',
  timezone: 'IST — GMT+5:30',
  availability: 'Available for select projects — 2026',
  email: 'hello@harsh.studio',
  year: 2026,
  footerNote: 'Designed & developed with intention',
};

/** Fixed navigation. `id` matches the section element it anchors to. */
export const NAV_LINKS = [
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

/** Fullscreen menu — the same destinations, stated at display size. */
export const MENU_LINKS = [
  { id: 'index', label: 'Index', href: '#top', index: '01' },
  { id: 'work', label: 'Work', href: '#work', index: '02' },
  { id: 'capabilities', label: 'What I Do', href: '#capabilities', index: '03' },
  { id: 'about', label: 'About', href: '#about', index: '04' },
  { id: 'contact', label: 'Contact', href: '#contact', index: '05' },
];

export const SOCIALS = [
  { id: 'email', label: 'Email', handle: 'hello@harsh.studio', href: 'mailto:hello@harsh.studio' },
  { id: 'instagram', label: 'Instagram', handle: '@harsh.visuals', href: '#' },
  { id: 'behance', label: 'Behance', handle: '/harsh', href: '#' },
  { id: 'linkedin', label: 'LinkedIn', handle: '/in/harsh', href: '#' },
];

/** Infinite marquee statement. Rendered as one repeating unit. */
export const MARQUEE_WORDS = ['Design', 'Motion', '3D', 'Digital', 'Experience'];

export const STATEMENTS = {
  transition: ['Ideas', 'in motion.'],
  marquee: ['Make', 'it', 'memorable.'],
  contact: ["Let's", 'make', 'something', 'unforgettable.'],
};
