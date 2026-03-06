/**
 * Apply migration 0004: planner constraints and indexes.
 * Run with: DATABASE_URL=... node scripts/apply_migration_0004.js
 */
import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0004_planner_constraints.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration 0004 (planner constraints and indexes)...");
  await client.query(sql);

  console.log("Verifying constraint...");
  const c = await client.query(
    `SELECT constraint_name FROM information_schema.table_constraints
     WHERE table_name='planned_sessions' AND constraint_name='planned_sessions_user_date_type_unique';`
  );
  console.log("planned_sessions_user_date_type_unique:", c.rows.length ? "ok" : "missing");
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
