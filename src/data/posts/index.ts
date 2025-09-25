// Explicit imports for migrated posts
import type { BlogPost } from "./types";
import papillionSpareKey from "./why-papillion-drivers-need-a-spare-car-key";
import carKeyProgramming from "./car-key-programming-omaha-guide";
import transparentPricing from "./transparent-locksmith-pricing-omaha";
import lockedOutOmaha from "./what-to-do-if-youre-locked-out-in-omaha";
import rekeyVsReplace from "./rekey-vs-replace-omaha";
import masterKeyGretna from "./master-key-systems-for-gretna-shops";
import mobileBellevue from "./mobile-locksmith-bellevue-time-saver";
import mythsOmaha from "./top-5-emergency-locksmith-myths-omaha";
import lockedOutOmaha from "./what-to-do-if-youre-locked-out-in-omaha";
import rekeyVsReplace from "./rekey-vs-replace-omaha";
import masterKeyGretna from "./master-key-systems-for-gretna-shops";
import mobileBellevue from "./mobile-locksmith-bellevue-time-saver";
import mythsOmaha from "./top-5-emergency-locksmith-myths-omaha";

// For all remaining posts not yet migrated, continue to rely on the legacy array.
import { BLOG_POSTS as LEGACY_BLOG_POSTS } from "../blogPosts";

// Build the combined list: migrated posts first, then any legacy posts that are not duplicates
const migrated = [
  papillionSpareKey,
  carKeyProgramming,
  transparentPricing,
  lockedOutOmaha,
  rekeyVsReplace,
  masterKeyGretna,
  mobileBellevue,
  mythsOmaha,
];
  papillionSpareKey,
  carKeyProgramming,
  transparentPricing,
  lockedOutOmaha,
  rekeyVsReplace,
  masterKeyGretna,
  mobileBellevue,
  mythsOmaha,
];

export const posts: BlogPost[] = [
  ...migrated,
  ...LEGACY_BLOG_POSTS.filter(p => !migrated.some(m => m.slug === p.slug)),
];

export function findPost(slug: string) {
  return posts.find(p => p.slug === slug);
}

// Re-export types for convenience
export type { BlogPost, BlogCategory } from "./types";