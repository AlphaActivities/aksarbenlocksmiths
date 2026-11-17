import { writeFile, realpath } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { SITE_ID } from "../../netlify/functions/lib/core.mjs";
try {
  const { values } = parseArgs({ options: { output: { type: "string" } } });
  if (
    !values.output ||
    !process.env.NETLIFY_AUTH_TOKEN ||
    !process.env.NETLIFY_FORM_ID
  )
    throw new Error("binding_required");
  const output = resolve(
    await realpath(dirname(values.output)),
    values.output.split("/").at(-1),
  );
  const root = await realpath(process.cwd());
  if (output === root || output.startsWith(root + "/"))
    throw new Error("export_must_stay_outside_checkout");
  const get = async (path) => {
    const r = await fetch(`https://api.netlify.com/api/v1/${path}`, {
      headers: { Authorization: `Bearer ${process.env.NETLIFY_AUTH_TOKEN}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error("provider_read_failed");
    return r.json();
  };
  const forms = await get(`sites/${SITE_ID}/forms`);
  if (
    !forms.some(
      (f) => f.id === process.env.NETLIFY_FORM_ID && f.name === "contact",
    )
  )
    throw new Error("form_mismatch");
  const submissions = [];
  for (let page = 1; page <= 100; page++) {
    const rows = await get(
      `forms/${process.env.NETLIFY_FORM_ID}/submissions?per_page=100&page=${page}`,
    );
    if (!Array.isArray(rows)) throw new Error("provider_format");
    submissions.push(...rows);
    if (rows.length < 100) break;
    if (page === 100) throw new Error("incomplete_export");
  }
  const bytes = JSON.stringify(
    {
      site_id: SITE_ID,
      form_id: process.env.NETLIFY_FORM_ID,
      form_name: "contact",
      submissions,
    },
    null,
    2,
  );
  await writeFile(output, bytes, { mode: 0o600, flag: "wx" });
  await writeFile(
    output + ".review.json",
    JSON.stringify(
      {
        export_sha256: createHash("sha256").update(bytes).digest("hex"),
        decisions: Object.fromEntries(
          submissions.map((s) => [s.id, "unreviewed"]),
        ),
      },
      null,
      2,
    ),
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    JSON.stringify({ exported: submissions.length, review_required: true }),
  );
} catch {
  console.error(
    "export_failed; verify secure bindings, output path and provider access. No private data logged.",
  );
  process.exitCode = 1;
}
