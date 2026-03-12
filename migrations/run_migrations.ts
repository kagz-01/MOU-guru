// migrations/run_migrations.ts
import { getConnection } from "../db/connection.ts";

async function run() {
  const client = await getConnection();
  try {
    console.log("Reading migration file migrations/001_initial.sql...");
    const sql = await Deno.readTextFile("./migrations/001_initial.sql");
    console.log("Beginning transaction and executing migration...");
    await client.queryArray("BEGIN");
    await client.queryArray(sql);
    await client.queryArray("COMMIT");
    console.log("Migration applied successfully.");
  } catch (err) {
    console.error("Migration failed, rolling back:", err);
    try {
      await client.queryArray("ROLLBACK");
    } catch (_e) {
      // ignore
    }
    Deno.exit(1);
  } finally {
    client.release();
  }
}

if (import.meta.main) {
  run();
}
