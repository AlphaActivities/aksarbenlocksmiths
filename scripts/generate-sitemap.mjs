import fs from "node:fs";
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE = "https://aksarbenlocksmiths.com";
const servicesJsonPath = resolve(__dirname, "../src/data/services.json");
let servicesData = { services: [] };
try {
  const raw = readFileSync(servicesJsonPath, "utf8");
  servicesData = JSON.parse(raw);
} catch (e) {
  console.error("Failed to read services.json", e);
  servicesData = { services: [] };
}

const blogTsPath = resolve(__dirname, "../src/data/blogPosts.ts");
let blogSlugs = [];
try {
  const blogSrc = readFileSync(blogTsPath, "utf8");
  const slugMatches = [...blogSrc.matchAll(/slug:\s*["'`]([^"'`]+)["'`]/g)];
  blogSlugs = slugMatches.map(m => m[1]);
} catch (e) {
  console.error("Failed to read blogPosts.ts", e);
  blogSlugs = [];
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const urls = [
  { loc: `${SITE}/`, changefreq: "weekly", priority: "1.0" },
  { loc: `${SITE}/blog`, changefreq: "weekly", priority: "0.8" },
  { loc: `${SITE}/service-areas`, changefreq: "monthly", priority: "0.8" },
  ...servicesData.services.map(s => ({
    loc: `${SITE}/services/${s.slug}`,
    changefreq: "monthly",
    priority: "0.8"
  })),
  ...blogSlugs.map(slug => ({
    loc: `${SITE}/blog/${slug}`,
    changefreq: "monthly",
    priority: "0.7"
  }))
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => {
    return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  }).join("\n") +
  `\n</urlset>\n`;

const outPath = resolve(__dirname, "../dist/sitemap.xml");
writeFileSync(outPath, xml, "utf8");
console.log("Sitemap written to", outPath);