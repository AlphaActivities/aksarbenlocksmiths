// Disposable embedded PostgreSQL only. No production connection or credentials.
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
const database = new PGlite();
try {
  await database.exec(await readFile("tests/crm/bootstrap.sql", "utf8"));
  for (const file of (await readdir("supabase/migrations")).filter(f=>f.endsWith(".sql")).sort()) {
    // gen_random_uuid is built into PostgreSQL; PGlite does not ship pgcrypto.
    const sql=(await readFile(`supabase/migrations/${file}`,"utf8")).replace(/^create extension if not exists pgcrypto;$/m,"");
    await database.exec(sql);
  }
  for (const file of ["policies.sql", "owner-policies.sql"]) {
    const sql=(await readFile(`tests/crm/${file}`,"utf8")).replace(/^\\.*$/gm,"");
    await database.exec(sql);
    console.log(`${file}: PostgreSQL policy/RPC assertions passed`);
  }
} catch (error) { console.error(error.message); process.exitCode=1; }
finally { await database.close(); }
