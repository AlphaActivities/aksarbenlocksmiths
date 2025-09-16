import { readFile, writeFile } from 'node:fs/promises';

function parseArg(name) {
  const p = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!p) return null;
  return p.slice(name.length + 3);
}

function loadJson(path, fallback) {
  return readFile(path, 'utf8').then(t => JSON.parse(t)).catch(() => fallback);
}

function saveJson(path, obj) {
  return writeFile(path, JSON.stringify(obj, null, 2) + '\n');
}

(async () => {
  const centralNowIso = parseArg('central-now');
  if (!centralNowIso) {
    console.error('Usage: node scripts/time-offset.mjs --central-now="YYYY-MM-DDTHH:mm:ss" (America/Chicago)');
    process.exit(1);
  }

  const centralNow = new Date(centralNowIso);
  if (isNaN(centralNow.getTime())) {
    console.error('Invalid ISO datetime for --central-now');
    process.exit(1);
  }

  const serverNow = new Date();
  const offsetMs = centralNow.getTime() - serverNow.getTime();

  const cfgPath = './docs/time-config.json';
  const cfg = await loadJson(cfgPath, {
    generated_at: new Date().toISOString(),
    timezone_label: 'Omaha, NE',
    iana_timezone: 'America/Chicago',
    format: 'YYYY MM DD hh:mm A Omaha, NE',
    dst: 'auto',
    notes: 'Use Intl.DateTimeFormat with timeZone America/Chicago, then reformat.'
  });

  cfg.generated_at = new Date().toISOString();
  cfg.manual_offset_ms = offsetMs;
  cfg.manual_offset_source = 'user_provided';
  await saveJson(cfgPath, cfg);

  console.log('server_iso_now=', serverNow.toISOString());
  console.log('central_now_iso=', centralNow.toISOString());
  console.log('manual_offset_ms=', offsetMs);
})();