import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src", "data", "posts");
const SKIP = new Set(["index.ts", "types.ts"]);

function kebabBase(filename: string) {
  return filename.replace(/\.ts$/, "");
}

let ok = true;
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".ts") && !SKIP.has(f));

for (const file of files) {
  const full = path.join(POSTS_DIR, file);
  const mod = require(full); // Node resolves TS transpiled by vite in dev; for CI use ts-node/register if needed
  const post = (mod.default || mod.post || mod);
  const base = kebabBase(file);
  if (!post?.slug) {
    console.error(`[posts] ${file} has no slug`);
    ok = false;
    continue;
  }
  if (post.slug !== base) {
    console.error(`[posts] filename "${base}" must equal slug "${post.slug}"`);
    ok = false;
  }
}

if (!ok) {
  process.exitCode = 1;
} else {
  console.log(`[posts] filenames match slugs for ${files.length} posts ✔`);
}