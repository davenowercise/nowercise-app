/**
 * Apply migration 0006: post_session_checkouts table.
 * Run with: node -r dotenv/config scripts/apply_migration_0006.js
 */
import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0006_post_session_checkouts.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration 0006 (post_session_checkouts)...");
  await client.query(sql);

  console.log("Verifying post_session_checkouts table...");
  const r = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'post_session_checkouts';`
  );
  console.log("post_session_checkouts:", r.rows.length ? "ok" : "missing");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
