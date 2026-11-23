// The hosted runner's multiprocess Chromium renderers crash. Use a new
// single-process Chromium instance for each case to avoid context reuse.
import { spawnSync } from "node:child_process";

const cli = "node_modules/@playwright/test/cli.js";
const env = { ...process.env, CRM_ISOLATED_CHROMIUM: "1" };
const listing = spawnSync(process.execPath, [cli, "test", "--list", "--reporter=json"], {
  env, encoding: "utf8", maxBuffer: 4 * 1024 * 1024,
});
if (listing.status !== 0) throw new Error(listing.stderr || "Playwright discovery failed");
const suites = JSON.parse(listing.stdout).suites;
function discover(items) {
  return items.flatMap(suite => [
    ...(suite.specs ?? []).flatMap(spec => spec.tests.map(test => ({
      title: spec.title,
      project: test.projectName,
    }))),
    ...discover(suite.suites ?? []),
  ]);
}

const cases = discover(suites);
const key = ({ project, title }) => JSON.stringify([project, title]);
if (!cases.length || new Set(cases.map(key)).size !== cases.length)
  throw new Error("Expected unique Playwright case titles per project");

let passed = 0;
for (const [index, { project, title }] of cases.entries()) {
  const pattern = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$";
  const result = spawnSync(process.execPath, [
    cli, "test", "--project", project, "--grep", pattern,
    "--output", `test-results/isolated-${index + 1}`,
  ], { env, stdio: "inherit" });
  if (result.status === 0) passed++;
}
console.log(`Isolated Chromium: ${passed}/${cases.length} passed`);
process.exitCode = passed === cases.length ? 0 : 1;
