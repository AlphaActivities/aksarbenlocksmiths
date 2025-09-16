import fs from "fs";

function centralNowStamp() {
  // Live Central Time with DST
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  // parts: { year:"2025", month:"09", day:"15", hour:"08", minute:"09", dayPeriod:"PM", ... }

  const yyyy = parts.year;
  const mm   = parts.month;
  const dd   = parts.day;
  let hh     = parts.hour.padStart(2, "0");
  const min  = parts.minute;
  const ampm = (parts.dayPeriod || "").toUpperCase() || "AM";

  return `${yyyy} ${mm} ${dd} ${hh}:${min} ${ampm} Omaha, NE`;
}

const stamp = centralNowStamp();

// Read, update, write
const cfgPath = "./docs/time-config.json";
let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8")); } catch {}
cfg.last_central_stamp = stamp;
cfg.generated_at = new Date().toISOString();

fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");

console.log("Saved last_central_stamp:", stamp);