import type { BlogPost, BlogCategory } from "../blogPosts";

// Stage 1, proxy: keep using the legacy BLOG_POSTS array so nothing breaks.
// We will replace this proxy with explicit imports as we migrate posts.
export { BLOG_POSTS as posts, findPost } from "../blogPosts";

// Re-export types so per-file modules can import from "@/data/posts"
export type { BlogPost, BlogCategory };