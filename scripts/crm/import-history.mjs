import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import {
  SITE_ID,
  TARGET_REF,
  normalizeSubmission,
  rpc,
} from "../../netlify/functions/lib/core.mjs";
export function planHistory(bytes, review) {
  const input = JSON.parse(bytes.toString());
  if (
    input.site_id !== SITE_ID ||
    input.form_name !== "contact" ||
    !input.form_id ||
    !Array.isArray(input.submissions)
  )
    throw new Error("export_identity_mismatch");
  if (review.export_sha256 !== createHash("sha256").update(bytes).digest("hex"))
    throw new Error("review_does_not_match_export");
  const ids = new Set();
  const records = [];
  let excluded = 0;
  for (const submission of input.submissions) {
    if (ids.has(submission.id)) throw new Error("duplicate_export_id");
    ids.add(submission.id);
    if (submission.form_id && submission.form_id !== input.form_id)
      throw new Error("form_mismatch");
    if (submission.site_id && submission.site_id !== SITE_ID)
      throw new Error("site_mismatch");
    const decision = review.decisions?.[submission.id];
    if (!["legitimate", "spam", "duplicate", "test"].includes(decision))
      throw new Error("every_record_requires_review");
    if (decision !== "legitimate") {
      excluded++;
      continue;
    }
    const normalized = normalizeSubmission(submission);
    if (!normalized) throw new Error("spam_cannot_be_approved");
    records.push(normalized);
  }
  if (Object.keys(review.decisions || {}).some((id) => !ids.has(id)))
    throw new Error("unknown_review_id");
  return {
    records,
    summary: { exported: ids.size, approved: records.length, excluded },
  };
}
async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: "string" },
      review: { type: "string" },
      apply: { type: "boolean", default: false },
      "target-ref": { type: "string" },
    },
  });
  if (!values.input || !values.review)
    throw new Error(
      "usage: --input PRIVATE_EXPORT --review PRIVATE_REVIEW [--apply --target-ref VERIFIED_REF]",
    );
  const bytes = await readFile(values.input);
  const plan = planHistory(
    bytes,
    JSON.parse(await readFile(values.review, "utf8")),
  );
  console.log(
    JSON.stringify({
      mode: values.apply ? "apply" : "dry_run",
      ...plan.summary,
    }),
  );
  if (values.apply) {
    if (values["target-ref"] !== TARGET_REF)
      throw new Error("explicit_target_ref_required");
    for (let i = 0; i < plan.records.length; i += 500)
      console.log(
        JSON.stringify(
          await rpc(
            "crm_ingest",
            { p_records: plan.records.slice(i, i + 500), p_history: true },
            { service: true },
          ),
        ),
      );
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(() => {
    console.error(
      "history_operation_failed; inspect review, target and secure bindings. No customer data logged.",
    );
    process.exitCode = 1;
  });
