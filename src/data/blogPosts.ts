// Legacy barrel retained for compatibility only.
// Posts now live as per-file modules in src/data/posts/* and are loaded by src/data/posts/index.ts.
// No BLOG_POSTS export here.
export type { BlogPost, BlogCategory } from "./types";
export { BLOG_CATEGORIES } from "./blogCategories";