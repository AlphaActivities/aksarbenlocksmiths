import type { BlogPost } from "./types";

// 1) Copy a post object from /src/data/blogPosts.ts
// 2) Paste it here as `const post: BlogPost = { ... }` with no field changes
// 3) Export default post
// 4) Save as /src/data/posts/<slug>.ts

const post: BlogPost = {
  slug: "why-papillion-drivers-need-a-spare-car-key",
  title: "Why Every Papillion Driver Should Have a Spare Key",
  category: "keys",
  city: "Papillion",
  date: "2021-03-16T00:00:00-06:00",
  excerpt: "Papillion drivers benefit from keeping a spare car key ready at home or in a safe place. A backup key prevents late night lockouts, avoids towing or dealership delays, and can cut replacement costs by a large margin.",
  coverImage: "/images/blog/spare-key-papillion.webp",
  altText: "Driver holding a spare car key near a vehicle door.",
  body: "PASTE THE FULL BODY TEXT HERE EXACTLY FROM THE ORIGINAL POST",
  keywords: ["Papillion spare key", "car key duplication", "Omaha metro locksmith"]
};

export default post;