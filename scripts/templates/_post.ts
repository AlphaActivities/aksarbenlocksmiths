import type { BlogPost } from "../../src/data/posts/types";

// Copy this into /src/data/posts/<your-slug>.ts and fill in all fields.
// Make sure filename === slug.

const post: BlogPost = {
  slug: "your-slug-here",
  title: "Readable Title Case",
  category: "emergency", // "emergency" | "keys" | "residential" | "commercial"
  city: "Omaha",
  date: new Date().toISOString(),
  excerpt: "150–160 character summary that reads naturally and sets search intent.",
  coverImage: "/images/blog/your-image.webp",
  altText: "Short, descriptive alt text for the image.",
  body: "Write the full post body here. Use paragraphs separated by blank lines.",
  keywords: ["primary keyword", "secondary", "city term", "brand term"]
};

export default post;