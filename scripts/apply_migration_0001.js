import fs from "node:fs";
import { Client } from "pg";

const sql = fs.readFileSync("migrations/0001_add_marker_comfortable_reps.sql", "utf8");

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("Applying migration...");
  await client.query(sql);

  console.log("Verifying column...");
  const res = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='marker_results' ORDER BY column_name;"
  );

  console.log(res.rows.map(r => r.column_name));
  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
