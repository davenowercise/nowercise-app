import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0002_add_mode_decision.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration 0002...");
  await client.query(sql);

  console.log("Verifying columns...");
  const gs = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='generated_sessions' AND column_name='mode_decision';"
  );
  const sh = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='session_history' AND column_name='mode_decision_json';"
  );
  console.log("generated_sessions.mode_decision:", gs.rows.length ? "ok" : "missing");
  console.log("session_history.mode_decision_json:", sh.rows.length ? "ok" : "missing");
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
