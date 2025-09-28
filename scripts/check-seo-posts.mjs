import fs from "node:fs";
import path from "node:path";

const postsDir = path.resolve(process.cwd(), "src/data/posts");
const bad = [];
const files = fs.readdirSync(postsDir).filter(n =>
  n.endsWith(".ts") && !["index.ts","types.ts"].includes(n) && !n.startsWith("_")
);

function grab(re, txt) { const m = txt.match(re); return m ? m[1] : ""; }

for (const fn of files) {
  const raw = fs.readFileSync(path.join(postsDir, fn), "utf8");
  const slug = grab(/slug:\s*["']([^"']+)["']/, raw);
  const excerpt = grab(/excerpt:\s*["`]([^"`]+)["`]/, raw);
  const keywordsArrayMatch = raw.match(/keywords:\s*\[([\s\S]*?)\]/);
  const keywordsCount = keywordsArrayMatch ? (keywordsArrayMatch[1].match(/["'][^"']+["']/g)||[]).length : 0;
  const updatedAt = grab(/updatedAt:\s*["']([^"']+)["']/, raw);
  const body = grab(/body:\s*["`]([\s\S]*?)["`]\s*,?\s*\n/, raw);

  if (!slug) bad.push(`${fn}: missing slug`);
  if (excerpt.length < 140 || excerpt.length > 180) bad.push(`${slug}: excerpt length ${excerpt.length}`);
  if (keywordsCount < 6 || keywordsCount > 8) bad.push(`${slug}: keywords count ${keywordsCount}`);
  if (updatedAt && isNaN(Date.parse(updatedAt))) bad.push(`${slug}: invalid updatedAt ${updatedAt}`);
  if (/^Related links/i.test(body.trim()) || body.includes("\nRelated links")) bad.push(`${slug}: contains 'Related links' block`);
}

if (bad.length) {
  console.error("[seo-check] FAIL\n" + bad.map(x=>" - "+x).join("\n"));
  process.exit(1);
} else {
  console.log("[seo-check] OK – all posts within guardrails");
}