import fs from "node:fs";
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { posts as BLOG_POSTS } from "../src/data/posts/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE = "https://aksarbenlocksmiths.com";

// Build blog entries with real lastmod dates
const blogEntries = BLOG_POSTS.map(p => ({
  loc: `${SITE}/blog/${p.slug}`,
  lastmod: (p.updatedAt || p.date || "").slice(0, 10),
  changefreq: "monthly",
  priority: "0.7",
}));

// Service pages with static lastmod for now
const servicePages = [
  { path: "residential", lastmod: "2025-09-25" },
  { path: "automotive", lastmod: "2025-09-25" },
  { path: "extraction", lastmod: "2025-09-25" },
  { path: "duplication", lastmod: "2025-09-25" },
  { path: "rekeying", lastmod: "2025-09-25" },
  { path: "consultation", lastmod: "2025-09-25" },
  { path: "emergency", lastmod: "2025-09-25" },
  { path: "lock-repair", lastmod: "2025-09-25" },
].map(x => ({
  loc: `${SITE}/services/${x.path}`,
  lastmod: x.lastmod,
  changefreq: "monthly",
  priority: "0.8",
}));

// Category pages with newest post date in each category
const categories = ["emergency", "keys", "residential", "commercial"];
const byCat = Object.fromEntries(categories.map(c => [c, BLOG_POSTS.filter(p => p.category === c)]));
const maxDate = arr => (arr.length ? arr.map(p => p.updatedAt || p.date).filter(Boolean).sort().at(-1).slice(0, 10) : "2025-01-15");

const categoryUrls = categories.map(c => ({
  loc: `${SITE}/blog/${c}`,
  lastmod: maxDate(byCat[c]),
  changefreq: "weekly",
  priority: "0.7",
}));

const blogIndex = [{
  loc: `${SITE}/blog`,
  lastmod: maxDate(BLOG_POSTS),
  changefreq: "weekly",
  priority: "0.8",
}];

// Compose final URL list
const urls = [
  { loc: `${SITE}/`, lastmod: maxDate(BLOG_POSTS), changefreq: "weekly", priority: "1.0" },
  { loc: `${SITE}/service-areas`, lastmod: "2025-01-15", changefreq: "monthly", priority: "0.8" },
  ...blogIndex,
  ...categoryUrls,
  ...servicePages,
  ...blogEntries,
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => {
    return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  }).join("\n") +
  `\n</urlset>\n`;

const outPath = resolve(__dirname, "../dist/sitemap.xml");
writeFileSync(outPath, xml, "utf8");
console.log("Sitemap written to", outPath);