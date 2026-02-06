import { db } from "./db";
import { templateExercises } from "../shared/schema";
import { sql } from "drizzle-orm";
import exerciseDataset from "./engine/data/exerciseDecisionDataset.json";

const dataset = exerciseDataset as any[];

const NAME_ALIASES: Record<string, string> = {
  "Band Pull Apart": "Band Pull Apart (Rear Delts)",
  "Band Squat (Supported)": "Band Squat (Supported if needed)",
  "Shoulder Shrugs": "Seated Shoulder Shrugs",
  "Arm Raises (Front)": "Seated Arm Raises",
  "Wall Push-Aways": "Wall Push Ups",
  "Standing Heel Raises": "Supported Heel Raises",
  "Breathing Recovery": "Calm Breathing",
  "Diaphragmatic Breathing": "Lying Long Exhale Breathing",
  "Gentle Core Breathing": "Calm Breathing",
  "Bicep Curls (Light/No Weight)": "Band Bicep Curl",
};

function findDatasetExercise(dbName: string) {
  const exact = dataset.find(d => d.name.toLowerCase() === dbName.toLowerCase());
  if (exact && exact.videoUrl) return exact;

  const alias = NAME_ALIASES[dbName];
  if (alias) {
    const aliased = dataset.find(d => d.name.toLowerCase() === alias.toLowerCase());
    if (aliased && aliased.videoUrl) return aliased;
  }

  const partial = dataset.find(d =>
    d.videoUrl &&
    (d.name.toLowerCase().includes(dbName.toLowerCase()) ||
     dbName.toLowerCase().includes(d.name.toLowerCase()))
  );
  if (partial) return partial;

  return null;
}

async function syncVideoUrls() {
  console.log("=== Syncing video URLs from dataset to DB ===\n");

  const allTemplateExercises = await db.select().from(templateExercises);
  console.log(`Found ${allTemplateExercises.length} template_exercises rows\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const te of allTemplateExercises) {
    if (!te.exerciseName) {
      skipped++;
      continue;
    }

    const match = findDatasetExercise(te.exerciseName);
    if (!match) {
      console.log(`  ? No dataset match for: "${te.exerciseName}" (template ${te.templateId})`);
      notFound++;
      continue;
    }

    const currentUrl = te.videoUrl || "";
    const newUrl = match.videoUrl;

    if (currentUrl === newUrl) {
      skipped++;
      continue;
    }

    await db.update(templateExercises)
      .set({
        videoUrl: newUrl,
        instructions: match.notes || te.instructions,
      })
      .where(sql`${templateExercises.id} = ${te.id}`);

    console.log(`  ✓ Updated "${te.exerciseName}" (template ${te.templateId})`);
    console.log(`    Old: ${currentUrl.substring(0, 60)}...`);
    console.log(`    New: ${newUrl.substring(0, 60)}...`);
    updated++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Already correct: ${skipped}`);
  console.log(`No match found: ${notFound}`);

  console.log("\n=== Syncing exercises table ===\n");

  const exercisesRows = await db.execute(sql`SELECT id, name, video_url FROM exercises`);
  let exUpdated = 0;
  for (const row of exercisesRows.rows) {
    const name = row.name as string;
    const match = findDatasetExercise(name);
    if (match) {
      const currentUrl = (row.video_url as string) || "";
      if (currentUrl !== match.videoUrl) {
        await db.execute(sql`UPDATE exercises SET video_url = ${match.videoUrl} WHERE id = ${row.id}`);
        console.log(`  ✓ exercises table: Updated "${name}"`);
        exUpdated++;
      }
    }
  }
  console.log(`\nExercises table updated: ${exUpdated}`);

  console.log("\n=== Verification: Any YouTube URLs remaining in template_exercises? ===");
  const youtubeRemaining = await db.execute(
    sql`SELECT id, template_id, exercise_name, video_url FROM template_exercises WHERE video_url LIKE '%youtube%' OR video_url LIKE '%youtu.be%'`
  );
  if (youtubeRemaining.rows.length === 0) {
    console.log("  None! All template_exercises now use Bunny HLS URLs.");
  } else {
    console.log(`  ${youtubeRemaining.rows.length} rows still have YouTube URLs:`);
    for (const row of youtubeRemaining.rows) {
      console.log(`    - "${row.exercise_name}" (template ${row.template_id}): ${row.video_url}`);
    }
  }

  console.log("\nDone!");
  process.exit(0);
}

syncVideoUrls().catch(e => {
  console.error(e);
  process.exit(1);
});
