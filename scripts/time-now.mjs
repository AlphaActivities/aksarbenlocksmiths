import { writeFile } from 'node:fs/promises';

async function centralTimeNow() {
  const url = 'https://worldtimeapi.org/api/timezone/America/Chicago';
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    // data.datetime is ISO, e.g. "2025-09-15T19:43:08.123-05:00"
    const d = new Date(data.datetime);
    return { source: 'network', date: d };
  } catch (e) {
    // Fallback to server "now" but force America/Chicago formatting
    return { source: 'fallback', date: new Date() };
  }
}

function formatChicago(d) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  }).formatToParts(d).reduce((a, p) => (a[p.type]=p.value, a), {});
  // YYYY MM DD hh:mm AM Omaha, NE
  return `${parts.year} ${parts.month} ${parts.day} ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()} Omaha, NE`;
}

(async () => {
  const net = await centralTimeNow();
  const out = {
    server_iso_now: new Date().toISOString(),
    chicago_formatted: formatChicago(net.date),
    source: net.source
  };
  console.log(out.server_iso_now);
  console.log(out.chicago_formatted);
  console.log(`source=${out.source}`);
  // Optional drop to a file other tools could read:
  await writeFile('./.bolt-last-timestamp.txt', out.chicago_formatted+'\n');
})();