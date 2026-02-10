import { db } from "../db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    ALTER TABLE user_adaptive_state
      ADD COLUMN IF NOT EXISTS last_session_rpe INT,
      ADD COLUMN IF NOT EXISTS last_session_pain INT,
      ADD COLUMN IF NOT EXISTS last_session_difficulty VARCHAR;
  `);

  const result = await db.execute(sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'user_adaptive_state'
      AND column_name IN ('last_session_rpe','last_session_pain','last_session_difficulty')
    ORDER BY column_name;
  `);

  console.log("Columns confirmed:", result);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
