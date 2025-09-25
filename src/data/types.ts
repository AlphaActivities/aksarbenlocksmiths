export type BlogCategory = "emergency" | "keys" | "residential" | "commercial";

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  city: string;
  date: string;        // ISO string, America/Chicago local business time
  excerpt: string;
  coverImage: string;  // public path under /images/blog
  altText: string;
  body: string;        // paragraphs separated by \n\n
  keywords: string[];
}