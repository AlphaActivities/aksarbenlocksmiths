// Legacy compatibility layer - all blog data now lives in /src/data/posts
export { posts as BLOG_POSTS, findPost } from "./posts";
export type { BlogPost, BlogCategory } from "./posts";

export const BLOG_CATEGORIES: { slug: BlogCategory; label: string }[] = [
  { slug: "emergency", label: "Emergency & Lockouts" },
  { slug: "keys", label: "Keys and Duplication" },
  { slug: "residential", label: "Residential Locksmith" },
  { slug: "commercial", label: "Commercial Locksmith" },
];