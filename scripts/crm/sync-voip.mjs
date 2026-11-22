import { readFile, rename, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { syncVoip, voipConfigured } from "../../netlify/functions/lib/voip.mjs";

const utcDay = date => date.toISOString().slice(0, 10);
function shift(day, delta) {
  const date = new Date(day + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + delta);
  return utcDay(date);
}

// A single worker polls the live window first, then recovers one older day per tick.
export async function pollCalls({ today, pending, sync, checkpoint }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pending) || shift(pending, 0) !== pending || pending > today)
    throw Error("invalid_checkpoint");
  const yesterday = shift(today, -1);
  for (const day of new Set([today, yesterday, pending])) await sync(day);
  if (pending < today) await checkpoint(shift(pending, 1));
}

export async function runWorker({ cycle, wait = sleep, clock = Date.now, signal, report }) {
  let failures = 0;
  while (!signal.aborted) {
    const started = clock();
    try {
      await cycle();
      failures = 0;
      report("sync_ok");
    } catch {
      failures = Math.min(failures + 1, 7);
      report("sync_failed");
    }
    const delay = failures ? Math.min(60000, 1000 * 2 ** (failures - 1)) : Math.max(0, 60000 - (clock() - started));
    if (!signal.aborted) await wait(delay);
  }
}

async function main() {
  const { CRM_VOIP_CURSOR_FILE: file, CRM_VOIP_START_DAY: start } = process.env;
  if (!voipConfigured(process.env) || !file || !start) throw Error("worker_not_configured");
  const controller = new AbortController();
  for (const name of ["SIGTERM", "SIGINT"]) process.once(name, () => controller.abort());
  await runWorker({
    signal: controller.signal,
    report: status => console.log(new Date().toISOString(), status),
    cycle: async () => {
      let pending;
      try { pending = (await readFile(file, "utf8")).trim(); }
      catch (error) { if (error.code !== "ENOENT") throw error; pending = start; }
      await pollCalls({ today: utcDay(new Date()), pending, sync: syncVoip, checkpoint: async day => {
        await writeFile(file + ".tmp", day, { mode: 0o600 });
        await rename(file + ".tmp", file);
      } });
    },
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(() => { console.error("worker_start_failed"); process.exitCode = 1; });
