import fs from "node:fs";
import path from "node:path";

const SITE = "https://aksarbenlocksmiths.com";
const postsDir = path.resolve(process.cwd(), "src/data/posts");

// helper: read all .ts post files (exclude index.ts, types.ts, templates, tests)
function listPostFiles() {
  const files = fs.readdirSync(postsDir, { withFileTypes: true });
  return files
    .filter(f => f.isFile())
    .map(f => f.name)
    .filter(n =>
      n.endsWith(".ts") &&
      n !== "index.ts" &&
      n !== "types.ts" &&
      !n.startsWith("_") &&
      n !== "_TEMPLATE_COPY_ME.ts"
    );
}

// helper: extract slug, updatedAt, date from a TS file
function extractMeta(tsPath) {
  const raw = fs.readFileSync(tsPath, "utf8");
  const get = (re) => {
    const m = raw.match(re);
    return m ? m[1] : "";
  };
  const slug = get(/slug:\s*["']([^"']+)["']/);
  const updatedAt = get(/updatedAt:\s*["']([^"']+)["']/);
  const date = get(/date:\s*["']([^"']+)["']/);
  return { slug, updatedAt, date };
}

function ymd(s) {
  return (s || "").slice(0, 10) || "";
}

// load posts
const postFiles = listPostFiles();
const posts = postFiles.map(fn => extractMeta(path.join(postsDir, fn))).filter(p => p.slug);

// categories helper for /blog/* lastmod
function maxDate(dates) {
  const arr = dates.filter(Boolean).sort();
  return arr.length ? arr.at(-1).slice(0, 10) : "2025-01-15";
}

const byCat = {};
for (const p of posts) {
  // read category too if present
  const raw = fs.readFileSync(path.join(postsDir, `${p.slug}.ts`), "utf8");
  const cat = (raw.match(/category:\s*["']([^"']+)["']/) || [,""])[1];
  if (!byCat[cat]) byCat[cat] = [];
  byCat[cat].push(p);
}

// assemble URLs
const urls = [];

// home
urls.push({ loc: `${SITE}/`, lastmod: maxDate(posts.map(p => p.updatedAt || p.date)), changefreq: "weekly", priority: "1.0" });

// blog index
urls.push({ loc: `${SITE}/blog`, lastmod: maxDate(posts.map(p => p.updatedAt || p.date)), changefreq: "weekly", priority: "0.8" });

// blog categories
for (const cat of Object.keys(byCat)) {
  urls.push({ loc: `${SITE}/blog/${cat}`, lastmod: maxDate(byCat[cat].map(p => p.updatedAt || p.date)), changefreq: "weekly", priority: "0.7" });
}

// services (static dates OK, adjust if you update a service)
const services = [
  "residential",
  "automotive",
  "extraction",
  "duplication",
  "rekeying",
  "consultation",
];
for (const s of services) {
  urls.push({ loc: `${SITE}/services/${s}`, lastmod: "2025-09-25", changefreq: "monthly", priority: "0.8" });
}

// service areas page
urls.push({ loc: `${SITE}/service-areas`, lastmod: "2025-09-25", changefreq: "monthly", priority: "0.8" });

// blog posts (use updatedAt || date)
for (const p of posts) {
  urls.push({ loc: `${SITE}/blog/${p.slug}`, lastmod: ymd(p.updatedAt || p.date) || "2025-01-15", changefreq: "monthly", priority: "0.7" });
}

// write XML
function toXml(u) {
  return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(toXml).join("\n")}
</urlset>
`;

const out = path.resolve(process.cwd(), "dist", "sitemap.xml");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, xml, "utf8");
console.log("Sitemap written to", out);