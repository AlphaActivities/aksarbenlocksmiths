import fs from "node:fs";
import path from "node:path";
const xml = fs.readFileSync(path.resolve("dist","sitemap.xml"), "utf8");
const need = [
  "why-papillion-drivers-need-a-spare-car-key",
  "car-key-programming-omaha-guide",
  "transparent-locksmith-pricing-omaha",
  "what-to-do-if-youre-locked-out-in-omaha",
  "rekey-vs-replace-omaha",
  "master-key-systems-for-gretna-shops",
  "mobile-locksmith-bellevue-time-saver",
  "top-5-emergency-locksmith-myths-omaha",
  "5-tips-to-keep-your-bellevue-home-secure",
  "common-lock-problems-la-vista-businesses-face",
  "avoid-late-night-lockouts-in-council-bluffs",
  "serving-omaha-for-over-a-decade"
];
const missing = need.filter(slug => !xml.includes(`/blog/${slug}`));
if (missing.length) {
  console.error("[sitemap-assert] Missing URLs:", missing);
  process.exit(1);
} else {
  console.log("[sitemap-assert] OK – all blog URLs present");
}