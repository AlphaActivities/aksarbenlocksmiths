import type { BlogPost } from "../blogPosts";
import * as legacy from "../blogPosts";

/**
 * Auto-load per-file posts placed in this folder:
 *   src/data/posts/<slug>.ts  -> export default <BlogPost>
 * These override legacy posts by slug. Keeps current site working while we migrate.
 */
const modules = import.meta.glob<{ default: BlogPost }>("./*.ts", { eager: true });
const filePosts: BlogPost[] = Object.values(modules)
  .map(m => m?.default)
  .filter(Boolean) as BlogPost[];

const map = new Map<string, BlogPost>((legacy.BLOG_POSTS || []).map(p => [p.slug, p]));
for (const p of filePosts) map.set(p.slug, p);

export const BLOG_POSTS: BlogPost[] =
  Array.from(map.values()).sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());

export const BLOG_CATEGORIES = legacy.BLOG_CATEGORIES;
export type { BlogPost } from "../blogPosts";

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}