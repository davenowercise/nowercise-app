import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0003_planned_sessions.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration 0003 (planned_sessions, session_events)...");
  await client.query(sql);

  console.log("Verifying tables...");
  const ps = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_name='planned_sessions';"
  );
  const se = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_name='session_events';"
  );
  console.log("planned_sessions:", ps.rows.length ? "ok" : "missing");
  console.log("session_events:", se.rows.length ? "ok" : "missing");
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
