// Explicit imports for migrated posts
import type { BlogPost } from "./types";
import papillionSpareKey from "./why-papillion-drivers-need-a-spare-car-key";
import carKeyProgramming from "./car-key-programming-omaha-guide";
import transparentPricing from "./transparent-locksmith-pricing-omaha";

// For all remaining posts not yet migrated, continue to rely on the legacy array.
import { BLOG_POSTS as LEGACY_BLOG_POSTS } from "../blogPosts";

// Build the combined list: migrated posts first, then any legacy posts that are not duplicates
const migrated = [papillionSpareKey, carKeyProgramming, transparentPricing];

export const posts: BlogPost[] = [
  ...migrated,
  ...LEGACY_BLOG_POSTS.filter(p => !migrated.some(m => m.slug === p.slug)),
];

export function findPost(slug: string) {
  return posts.find(p => p.slug === slug);
}

// Re-export types for convenience
export type { BlogPost, BlogCategory } from "./types";