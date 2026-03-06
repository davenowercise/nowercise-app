/**
 * Apply migration 0005: planner readiness table.
 * Run with: node -r dotenv/config scripts/apply_migration_0005.js
 */
import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0005_planner_readiness.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration 0005 (planner_readiness)...");
  await client.query(sql);

  console.log("Verifying planner_readiness table...");
  const r = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'planner_readiness';`
  );
  console.log("planner_readiness:", r.rows.length ? "ok" : "missing");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
