import fs from "node:fs";
import path from "node:path";
import servicesData from "../src/data/services.json" assert { type: "json" };

const site = "https://aksarbenlocksmiths.com";
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const urls = [
  { loc: `${site}/`, changefreq: "weekly", priority: "1.0" },
  ...servicesData.services.map(s => ({
    loc: `${site}/services/${s.slug}`,
    changefreq: "monthly",
    priority: "0.8"
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

const outPath = path.join(process.cwd(), "public", "sitemap.xml");
fs.writeFileSync(outPath, xml);
console.log("Sitemap written to", outPath);