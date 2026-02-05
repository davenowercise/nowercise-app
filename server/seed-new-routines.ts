import { db } from "./db";
import { sessionTemplates, templateExercises } from "../shared/schema";
import exerciseDataset from "./engine/data/exerciseDecisionDataset.json";

const exercises = exerciseDataset as any[];

function findExercise(name: string) {
  const ex = exercises.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (!ex || !ex.videoUrl) {
    console.error(`WARNING: Exercise "${name}" not found or has no video!`);
    return null;
  }
  return ex;
}

async function seedRoutines() {
  console.log("Creating 6 new workout routines...\n");

  const routines = [
    {
      templateCode: "EARLY_RESET_BREATHE",
      name: "Reset & Breathe",
      description: "A calming session focused on breathing and gentle posture work. Perfect for recovery days or when energy is low.",
      sessionType: "mobility",
      pathwayId: "breast_cancer",
      pathwayStage: 1,
      estimatedMinutes: 10,
      displayTitle: "Reset & Breathe",
      displayDescription: "10 minutes of calming breathing and posture reset",
      exercises: [
        "Calm Breathing",
        "Lying Long Exhale Breathing",
        "Seated Posture Reset",
        "Gentle Chest Open",
        "Gentle elbow bend & extend",
        "Seated Shoulder Shrugs"
      ]
    },
    {
      templateCode: "EARLY_MOBILITY_MIX",
      name: "Mobility Mix (Upper + Lower)",
      description: "Gentle mobility for the whole body. Chair and wall friendly exercises.",
      sessionType: "mobility",
      pathwayId: "breast_cancer",
      pathwayStage: 1,
      estimatedMinutes: 12,
      displayTitle: "Mobility Mix",
      displayDescription: "12 minutes of gentle full-body mobility",
      exercises: [
        "Calm Breathing",
        "Pendulum arm swings",
        "Table slides",
        "Standing Weight Shifts",
        "Ankle Pumps",
        "Seated Torso Twists",
        "Seated Posture Reset"
      ]
    },
    {
      templateCode: "EARLY_CIRCULATION_BALANCE",
      name: "Circulation & Balance",
      description: "Very gentle exercises to promote circulation and build balance confidence. All supported.",
      sessionType: "mobility",
      pathwayId: "breast_cancer",
      pathwayStage: 1,
      estimatedMinutes: 10,
      displayTitle: "Circulation & Balance",
      displayDescription: "10 minutes of gentle circulation and balance work",
      exercises: [
        "Calm Breathing",
        "Ankle Pumps",
        "Seated Heel Raises",
        "Seated Knee Lifts",
        "Standing Weight Shifts",
        "Supported Standing March"
      ]
    },
    {
      templateCode: "MID_LOWER_STRENGTH",
      name: "Lower Body Strength",
      description: "Build lower body strength with no overhead movements. Chair and wall supported options.",
      sessionType: "strength",
      pathwayId: "breast_cancer",
      pathwayStage: 2,
      estimatedMinutes: 15,
      displayTitle: "Lower Body Strength",
      displayDescription: "15 minutes of supported lower body strengthening",
      exercises: [
        "Calm Breathing",
        "Standing Weight Shifts",
        "Sit to Stand",
        "Supported Standing March",
        "Supported Heel Raises",
        "Band Squat (Supported if needed)",
        "Seated Posture Reset"
      ]
    },
    {
      templateCode: "MID_UPPER_STRENGTH",
      name: "Upper Body Strength",
      description: "Gentle upper body strengthening with band work. Respects post-op shoulder restrictions.",
      sessionType: "strength",
      pathwayId: "breast_cancer",
      pathwayStage: 2,
      estimatedMinutes: 15,
      displayTitle: "Upper Body Strength",
      displayDescription: "15 minutes of gentle upper body band work",
      exercises: [
        "Calm Breathing",
        "Gentle Chest Open",
        "Wall Push Ups",
        "Band Hammer Curl",
        "Band Bicep Curl",
        "Tiny-range shoulder blade squeeze",
        "Seated Posture Reset"
      ]
    },
    {
      templateCode: "MID_FULL_BODY",
      name: "Full Body Strength (Conservative)",
      description: "A balanced full-body session with conservative exercise selection. All movements are supported.",
      sessionType: "strength",
      pathwayId: "breast_cancer",
      pathwayStage: 2,
      estimatedMinutes: 18,
      displayTitle: "Full Body Strength",
      displayDescription: "18 minutes of balanced full-body strengthening",
      exercises: [
        "Calm Breathing",
        "Standing Weight Shifts",
        "Sit to Stand",
        "Wall Push Ups",
        "Band Hammer Curl",
        "Supported Heel Raises",
        "Seated Posture Reset"
      ]
    }
  ];

  for (const routine of routines) {
    console.log(`\n=== ${routine.templateCode}: ${routine.name} ===`);
    
    const validExercises = [];
    for (const exName of routine.exercises) {
      const ex = findExercise(exName);
      if (ex) {
        validExercises.push({ name: exName, videoUrl: ex.videoUrl, notes: ex.notes });
        console.log(`  ✓ ${exName}`);
      } else {
        console.log(`  ✗ ${exName} - MISSING VIDEO`);
      }
    }

    const [template] = await db.insert(sessionTemplates).values({
      templateCode: routine.templateCode,
      name: routine.name,
      description: routine.description,
      sessionType: routine.sessionType,
      pathwayId: routine.pathwayId,
      pathwayStage: routine.pathwayStage,
      estimatedMinutes: routine.estimatedMinutes,
      displayTitle: routine.displayTitle,
      displayDescription: routine.displayDescription,
      isActive: true,
      sortOrder: 0
    }).returning();

    console.log(`  Created template ID: ${template.id}`);

    for (let i = 0; i < validExercises.length; i++) {
      const ex = validExercises[i];
      await db.insert(templateExercises).values({
        templateId: template.id,
        exerciseName: ex.name,
        videoUrl: ex.videoUrl,
        instructions: ex.notes,
        sets: 1,
        reps: ex.name.includes("Breathing") ? "5-10 breaths" : "8-12",
        sortOrder: i + 1
      });
    }
    console.log(`  Added ${validExercises.length} exercises`);
  }

  console.log("\n\nDone! Created 6 new routines.");
  process.exit(0);
}

seedRoutines().catch(e => {
  console.error(e);
  process.exit(1);
});
