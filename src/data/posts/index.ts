import type { BlogPost } from "../blogPosts";
import * as legacy from "../blogPosts";

/**
 * Auto-load any per-file posts in this folder.
 * Each file should `export default` a BlogPost object.
 * Example: src/data/posts/why-every-papillion-driver-should-have-a-spare-car-key.ts
 */
const modules = import.meta.glob<{ default: BlogPost }>("./*.ts", { eager: true });
const filePosts: BlogPost[] = Object.values(modules)
  .map((m) => m?.default)
  .filter(Boolean) as BlogPost[];

// Start with legacy posts, then override by slug with any per-file posts
const bySlug = new Map<string, BlogPost>((legacy.BLOG_POSTS || []).map(p => [p.slug, p]));
for (const p of filePosts) bySlug.set(p.slug, p);

// Final export, newest first
export const BLOG_POSTS: BlogPost[] = Array.from(bySlug.values()).sort((a, b) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
});

export const BLOG_CATEGORIES = legacy.BLOG_CATEGORIES;
export type { BlogPost } from "../blogPosts";

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}