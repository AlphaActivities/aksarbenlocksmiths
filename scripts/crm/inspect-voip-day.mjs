import { Fault } from "../../netlify/functions/lib/core.mjs";
import { inspectVoipDay } from "../../netlify/functions/lib/voip.mjs";

if (process.argv.length !== 3) {
  console.error("Usage: node scripts/crm/inspect-voip-day.mjs YYYY-MM-DD");
  process.exitCode = 1;
} else {
  try {
    console.log(JSON.stringify(await inspectVoipDay(process.argv[2]), null, 2));
  } catch (error) {
    console.error(error instanceof Fault ? error.message : "voip_inspection_failed");
    process.exitCode = 1;
  }
}
