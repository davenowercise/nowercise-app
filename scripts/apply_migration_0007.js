/**
 * Apply migration 0007: red_flag_checks table.
 * Run with: node -r dotenv/config scripts/apply_migration_0007.js
 */
import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0007_red_flag_checks.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration 0007 (red_flag_checks)...");
  await client.query(sql);

  console.log("Verifying red_flag_checks table...");
  const r = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'red_flag_checks';`
  );
  console.log("red_flag_checks:", r.rows.length ? "ok" : "missing");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
