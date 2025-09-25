import type { BlogPost } from "../types";
import { BLOG_CATEGORIES } from "../blogCategories";

/**
 * Auto-load per-file posts placed in this folder:
 *   src/data/posts/<slug>.ts  -> export default <BlogPost>
 * All posts are now per-file. Legacy array has been retired.
 */
const modules = import.meta.glob<{ default: BlogPost }>("./*.ts", { eager: true });
const filePosts: BlogPost[] = Object.values(modules)
  .map(m => m?.default)
  .filter(Boolean) as BlogPost[];

// Legacy array retired, map is built solely from per-file posts
const map = new Map<string, BlogPost>();
for (const p of filePosts) map.set(p.slug, p);

export const BLOG_POSTS: BlogPost[] =
  Array.from(map.values()).sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());

export { BLOG_CATEGORIES };
export type { BlogPost } from "../types";

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}