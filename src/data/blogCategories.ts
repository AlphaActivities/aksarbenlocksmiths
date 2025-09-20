export type BlogCategorySlug = 'emergency' | 'keys' | 'residential' | 'commercial';

export const BLOG_CATEGORIES: Record<BlogCategorySlug, {
  title: string;
  h1: string;
  seoDescription: string;
  intro: string;
}> = {
  emergency: {
    title: 'Emergency Locksmith Tips & Guides | Aksarben Locksmiths Blog',
    h1: 'Emergency Locksmith Guides for Omaha',
    seoDescription: 'Lockouts, urgent entry, broken keys and after-hours help in Omaha. Practical emergency locksmith guides from Aksarben Locksmiths.',
    intro:
      'When you're locked out or a key breaks at the worst time, knowing your options saves money and stress. These articles explain what to do first, what to avoid, and how pros handle emergency calls safely and quickly in the Omaha metro.',
  },
  keys: {
    title: 'Keys, Duplication & Programming | Aksarben Locksmiths Blog',
    h1: 'Keys, Cutting & Programming',
    seoDescription: 'Spare keys, car key programming, high-security blanks and duplication best practices for Omaha drivers and homeowners.',
    intro:
      'From car transponders to high-security house keys, this section covers smart ways to get spares, what programming really means, and how to avoid common key pitfalls.',
  },
  residential: {
    title: 'Home Security & Lock Advice | Aksarben Locksmiths Blog',
    h1: 'Residential Locks & Home Security',
    seoDescription: 'Rekey vs replace, deadbolt choices, door hardware and home security checklists tailored for Omaha neighborhoods.',
    intro:
      'Not sure whether to rekey or replace? Wonder which deadbolt is worth it? Start here for practical guides that make homes safer without overspending.',
  },
  commercial: {
    title: 'Business & Commercial Locking Systems | Aksarben Locksmiths Blog',
    h1: 'Commercial Doors, Hardware & Access',
    seoDescription: 'Master key systems, storefront repairs and door hardware guidance for Omaha shops, offices and facilities.',
    intro:
      'Keep doors working, keys controlled and staff moving. These articles break down commercial hardware choices, master key planning and common repair scenarios.',
  },
};

export function isValidCategory(slug: string): slug is BlogCategorySlug {
  return ['emergency','keys','residential','commercial'].includes(slug);
}