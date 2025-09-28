import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join("src", "data", "posts");
const files = fs.readdirSync(POSTS_DIR).filter(f =>
  f.endsWith(".ts") && !["_TEMPLATE_COPY_ME.ts", "index.ts", "types.ts"].includes(f)
);

let changed = 0;

for (const file of files) {
  const p = path.join(POSTS_DIR, file);
  let src = fs.readFileSync(p, "utf8");

  // Only operate inside body: `body: \`...\``
  src = src.replace(
    /(body:\s*`)([\s\S]*?)(`)/g,
    (_m, start, body, end) => {
      // Replace Unicode em/en dashes surrounded by optional spaces with ", "
      // Cases: " — ", "–", " —", "— " etc. We normalize to ", "
      const replaced = body
        // dash with surrounding spaces
        .replace(/\s[–—]\s/g, ", ")
        // dash followed by space (e.g., "word— next")
        .replace(/([^\s])[–—]\s/g, (_m, pre) => `${pre}, `)
        // space then dash then end-of-line or punctuation (rare)
        .replace(/\s[–—]([^\s])/g, (_m, next) => `, ${next}`);

      if (replaced !== body) changed++;
      return `${start}${replaced}${end}`;
    }
  );

  fs.writeFileSync(p, src, "utf8");
}

console.log(`[normalize-dashes] Updated bodies in ${changed} file(s).`);