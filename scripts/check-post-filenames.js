const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(process.cwd(), "src", "data", "posts");
const SKIP = new Set(["index.ts", "types.ts"]);

function read(file) {
  return fs.readFileSync(file, "utf8");
}

// crude but safe: find slug: "..."
function extractSlug(source) {
  const m = source.match(/slug:\s*["'`](.+?)["'`]/);
  return m ? m[1] : null;
}

let ok = true;
const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".ts") && !SKIP.has(f));

for (const f of files) {
  const base = f.replace(/\.ts$/, "");
  const full = path.join(POSTS_DIR, f);
  const slug = extractSlug(read(full));
  if (!slug) {
    console.error(`[posts] ${f} has no slug`);
    ok = false;
    continue;
  }
  if (slug !== base) {
    console.error(`[posts] filename "${base}" must equal slug "${slug}"`);
    ok = false;
  }
}

if (!ok) process.exitCode = 1;
else console.log(`[posts] filenames match slugs for ${files.length} posts ✔`);