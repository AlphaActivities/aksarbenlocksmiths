import { readFileSync, appendFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const docsDir = resolve(root, "docs");
const files = {
  lhHome: resolve(docsDir, "lh-home.json"),
  lhBlog: resolve(docsDir, "lh-blog.json"),
  lhService: resolve(docsDir, "lh-service.json"),
  axeHome: resolve(docsDir, "axe-home.json"),
  axeBlog: resolve(docsDir, "axe-blog.json"),
  axeService: resolve(docsDir, "axe-service.json"),
};

const pct = (n) => (typeof n === "number" ? Math.round(n * 100) : "—");

function readLH(fp) {
  if (!existsSync(fp)) return null;
  try {
    const j = JSON.parse(readFileSync(fp, "utf8"));
    // Lighthouse CLI v10+ emits an array when multiple runs; handle both
    const rep = Array.isArray(j) ? j[0] : j;
    const c = rep?.categories || {};
    return {
      performance: pct(c.performance?.score),
      accessibility: pct(c.accessibility?.score),
      bestPractices: pct(c["best-practices"]?.score),
      seo: pct(c.seo?.score),
      finalUrl: rep?.finalDisplayedUrl || rep?.requestedUrl || "n/a",
    };
  } catch {
    return null;
  }
}

function readAxe(fp) {
  if (!existsSync(fp)) return null;
  try {
    const j = JSON.parse(readFileSync(fp, "utf8"));
    // axe CLI returns { violations: [...], passes: [...], ... }
    const v = j?.violations || [];
    return {
      violations: v.length,
      critical: v.filter((x) => x.impact === "critical").length,
      serious: v.filter((x) => x.impact === "serious").length,
      moderate: v.filter((x) => x.impact === "moderate").length,
      minor: v.filter((x) => x.impact === "minor").length,
      url: j?.url || "n/a",
    };
  } catch {
    return null;
  }
}

const now = new Date();
const stamp = now.toISOString().replace(/\.\d{3}Z$/, "Z");
const lhHome = readLH(files.lhHome);
const lhBlog = readLH(files.lhBlog);
const lhService = readLH(files.lhService);
const axeHome = readAxe(files.axeHome);
const axeBlog = readAxe(files.axeBlog);
const axeService = readAxe(files.axeService);

const lines = [];
lines.push(`## QA Audit — ${stamp}`);
lines.push("");
lines.push("| Page | Perf | A11y | Best Prac | SEO | Axe Violations | Details |");
lines.push("|------|-----:|-----:|----------:|----:|---------------:|---------|");

function row(name, lh, axe) {
  const perf = lh?.performance ?? "—";
  const a11y = lh?.accessibility ?? "—";
  const bp = lh?.bestPractices ?? "—";
  const seo = lh?.seo ?? "—";
  const vio = axe ? `${axe.violations} (crit:${axe.critical}, ser:${axe.serious}, mod:${axe.moderate}, min:${axe.minor})` : "—";
  const urls = [];
  if (lh?.finalUrl && lh.finalUrl !== "n/a") urls.push(`LH: ${lh.finalUrl}`);
  if (axe?.url && axe.url !== "n/a") urls.push(`axe: ${axe.url}`);
  lines.push(`| ${name} | ${perf}% | ${a11y}% | ${bp}% | ${seo}% | ${vio} | ${urls.join("<br>")} |`);
}

row("Home", lhHome, axeHome);
row("Blog Post", lhBlog, axeBlog);
row("Service Page", lhService, axeService);

lines.push("");
lines.push("- Notes: Scores are rounded. Violations are counts from axe-core CLI.");
lines.push("");

const logPath = resolve(docsDir, "deploy-log.md");
appendFileSync(logPath, lines.join("\n") + "\n", "utf8");
console.log(`Appended QA summary to ${logPath}`);