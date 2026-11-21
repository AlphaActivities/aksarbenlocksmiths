// Disposable embedded PostgreSQL only. No production connection or credentials.
import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
const database = new PGlite();
const upgrade = new PGlite();
try {
  const bootstrap = await readFile("tests/crm/bootstrap.sql", "utf8");
  const files = (await readdir("supabase/migrations")).filter(file => file.endsWith(".sql")).sort();
  const migrations = await Promise.all(files.map(async file =>
    // gen_random_uuid is built into PostgreSQL; PGlite does not ship pgcrypto.
    (await readFile(`supabase/migrations/${file}`, "utf8")).replace(/^create extension if not exists pgcrypto;$/m, ""),
  ));
  await database.exec(bootstrap);
  for (const sql of migrations) await database.exec(sql);
  for (const file of ["policies.sql", "owner-policies.sql"]) {
    const sql=(await readFile(`tests/crm/${file}`,"utf8")).replace(/^\\.*$/gm,"");
    await database.exec(sql);
    console.log(`${file}: PostgreSQL policy/RPC assertions passed`);
  }

  const firstAdditive = files.indexOf("202611210001_notification_inbox.sql");
  assert.equal(firstAdditive, 2, "review the production baseline before rehearsing a new sequence");
  await upgrade.exec(bootstrap);
  for (const sql of migrations.slice(0, firstAdditive)) await upgrade.exec(sql);
  await upgrade.exec(`
    insert into auth.users(id) values('10000000-0000-4000-8000-000000000011');
    insert into crm_memberships values('c1000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000011','staff');
    select crm_ingest('[{"source":"manual","provider_id":"pre-release-active","name":"Synthetic existing callback",
      "service":"Other","urgency":"urgent","created_at":"2025-03-01T00:00:00Z"}]');
    select crm_ingest('[{"source":"netlify","provider_id":"pre-release-history","name":"Synthetic historical import",
      "service":"Other","urgency":"quote","created_at":"2025-02-01T00:00:00Z"}]', true);
    select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000011', false);
  `);
  const capture = async () => (await upgrade.query(`
    select crm_snapshot() as queue,
      (select jsonb_agg(m) from crm_memberships m) as memberships,
      (select jsonb_agg(e order by id) from crm_events e) as events,
      (select jsonb_agg(o order by id) from crm_outbox o) as outbox
  `)).rows[0];
  const before = await capture();
  assert.equal(before.queue.attention, 1);
  assert.equal(before.queue.leads.length, 2);
  for (const sql of migrations.slice(firstAdditive)) await upgrade.exec(sql);
  assert.deepEqual(await capture(), before);
  await upgrade.exec("set role authenticated");
  const { inbox } = (await upgrade.query("select crm_notification_inbox() as inbox")).rows[0];
  assert.equal(inbox.attention, before.queue.attention);
  assert.deepEqual(inbox.active.map(row => row.name), ["Synthetic existing callback"]);
  assert.deepEqual(inbox.history, []);
  console.log("Populated CRM upgrade: memberships, leads, events, outbox, and attention preserved");
} catch (error) { console.error(error.message); process.exitCode=1; }
finally { await database.close(); await upgrade.close(); }
