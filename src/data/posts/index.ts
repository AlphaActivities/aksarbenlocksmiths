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
import tipsBellevue from "./5-tips-to-keep-your-bellevue-home-secure";
import commonLaVista from "./common-lock-problems-la-vista-businesses-face";
import avoidCouncilBluffs from "./avoid-late-night-lockouts-in-council-bluffs";
import servingOmaha from "./serving-omaha-for-over-a-decade";
import motorcycleKeyReplacement from "./motorcycle-key-replacement-omaha-fast";
import commercialDoorMaintenance from "./top-5-commercial-door-maintenance-tips-omaha";
import protectSpareKeys from "./how-to-protect-your-spare-keys-from-thieves-and-digital-scanners";

// Build the combined list: all posts now migrated to per-file modules
const migrated = [
  papillionSpareKey,
  carKeyProgramming,
  transparentPricing,
  lockedOutOmaha,
  rekeyVsReplace,
  masterKeyGretna,
  mobileBellevue,
  mythsOmaha,
  tipsBellevue,
  commonLaVista,
  avoidCouncilBluffs,
  servingOmaha,
  motorcycleKeyReplacement,
  commercialDoorMaintenance,
  protectSpareKeys,
];

export const posts: BlogPost[] = migrated;

// Dev-only sanity log
if (import.meta.env.DEV) {
  const counts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const slugs = posts.map(p => p.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) {
    // eslint-disable-next-line no-console
    console.error("[Blog posts] Duplicate slugs detected:", Array.from(new Set(dupes)));
  }
  // eslint-disable-next-line no-console
  console.log(`[Blog posts] Loaded ${posts.length} posts by category:`, counts);
}

export function findPost(slug: string) {
  return posts.find(p => p.slug === slug);
}

// Re-export types for convenience
export type { BlogPost, BlogCategory } from "./types";