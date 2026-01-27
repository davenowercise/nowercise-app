import * as fs from 'fs';
import * as path from 'path';

const REQUIRED_COLUMNS = [
  'Exercise name (match DB)',
  'Video URL (optional)',
  'Phase',
  'Stage (optional)',
  'Type',
  'Region',
  'Intensity tier',
  'Equipment',
  'Lymph-safe',
  'Post-op shoulder safe',
  'Notes (symptom mods / cues)',
  'Movement Pattern'
];

const VALID_PHASES = ['PREHAB', 'IN_TREATMENT', 'POST_TREATMENT', 'ALL'];
const VALID_INTENSITY = ['VERY_LOW', 'LOW', 'MODERATE'];

interface ExerciseRow {
  name: string;
  videoUrl: string;
  phase: string;
  stage: string;
  type: string;
  region: string;
  intensity: string;
  equipment: string;
  lymphSafe: string;
  postOpShoulderSafe: string;
  notes: string;
  movementPattern: string;
}

interface ExerciseDecisionData {
  id: string;
  name: string;
  phase: string[];
  stage: string;
  type: string;
  region: string;
  intensity: string;
  equipment: string;
  lymphSafe: boolean;
  postOpShoulderSafe: boolean;
  movementPattern: string;
  videoUrl: string;
  notes: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(line => parseCSVLine(line));
  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

function yesNoToBoolean(value: string): boolean {
  return value.toUpperCase() === 'YES';
}

function parsePhase(phase: string): string[] {
  if (phase.toUpperCase() === 'ALL') {
    return ['PREHAB', 'IN_TREATMENT', 'POST_TREATMENT'];
  }
  return phase.split(',').map(p => p.trim().toUpperCase());
}

function main() {
  const csvPath = path.join(process.cwd(), 'nowercise_decision_engine_dataset_v1.csv');
  const outputPath = path.join(process.cwd(), 'server/engine/data/exerciseDecisionDataset.json');
  
  console.log('========================================');
  console.log('Nowercise Decision Engine Dataset Builder');
  console.log('========================================\n');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: CSV file not found at ${csvPath}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const { headers, rows } = parseCSV(content);
  
  console.log('1️⃣ COLUMN VALIDATION');
  console.log('---------------------');
  
  const missingColumns: string[] = [];
  REQUIRED_COLUMNS.forEach(col => {
    if (!headers.includes(col)) {
      missingColumns.push(col);
    }
  });
  
  if (missingColumns.length > 0) {
    console.error('ERROR: Missing required columns:');
    missingColumns.forEach(col => console.error(`  - ${col}`));
    process.exit(1);
  }
  
  console.log(`✓ All ${REQUIRED_COLUMNS.length} required columns found\n`);
  
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => colIndex[h] = i);
  
  const exercises: ExerciseDecisionData[] = [];
  const issues = {
    missingVideoUrl: 0,
    invalidIntensity: [] as string[],
    invalidPhase: [] as string[],
    emptyMovementPattern: [] as string[]
  };
  
  rows.forEach((row, rowIndex) => {
    if (row.length < headers.length) return;
    
    const name = row[colIndex['Exercise name (match DB)']];
    if (!name) return;
    
    const videoUrl = row[colIndex['Video URL (optional)']] || '';
    const phase = row[colIndex['Phase']] || '';
    const stage = row[colIndex['Stage (optional)']] || '';
    const type = row[colIndex['Type']] || '';
    const region = row[colIndex['Region']] || '';
    const intensity = row[colIndex['Intensity tier']] || '';
    const equipment = row[colIndex['Equipment']] || '';
    const lymphSafe = row[colIndex['Lymph-safe']] || '';
    const postOpShoulderSafe = row[colIndex['Post-op shoulder safe']] || '';
    const notes = row[colIndex['Notes (symptom mods / cues)']] || '';
    const movementPattern = row[colIndex['Movement Pattern']] || '';
    
    if (!videoUrl) {
      issues.missingVideoUrl++;
    }
    
    if (!VALID_INTENSITY.includes(intensity.toUpperCase())) {
      issues.invalidIntensity.push(`Row ${rowIndex + 2}: "${name}" has intensity "${intensity}"`);
    }
    
    const phaseUpper = phase.toUpperCase();
    if (!VALID_PHASES.includes(phaseUpper) && phaseUpper !== 'ALL') {
      const phaseParts = phaseUpper.split(',').map(p => p.trim());
      const invalidParts = phaseParts.filter(p => !VALID_PHASES.includes(p));
      if (invalidParts.length > 0) {
        issues.invalidPhase.push(`Row ${rowIndex + 2}: "${name}" has phase "${phase}"`);
      }
    }
    
    if (!movementPattern) {
      issues.emptyMovementPattern.push(`Row ${rowIndex + 2}: "${name}"`);
    }
    
    exercises.push({
      id: slugify(name),
      name,
      phase: parsePhase(phase),
      stage: stage.toUpperCase() || 'ALL',
      type: type.toUpperCase(),
      region: region.toUpperCase(),
      intensity: intensity.toUpperCase(),
      equipment: equipment.toUpperCase(),
      lymphSafe: yesNoToBoolean(lymphSafe),
      postOpShoulderSafe: yesNoToBoolean(postOpShoulderSafe),
      movementPattern: movementPattern.toUpperCase(),
      videoUrl,
      notes
    });
  });
  
  console.log('2️⃣ DATA VALIDATION SUMMARY');
  console.log('---------------------------');
  console.log(`Total exercises found: ${exercises.length}`);
  console.log(`Exercises missing video_url: ${issues.missingVideoUrl}`);
  console.log('');
  
  if (issues.invalidIntensity.length > 0) {
    console.log(`⚠️  Invalid Intensity tier (${issues.invalidIntensity.length}):`);
    issues.invalidIntensity.forEach(msg => console.log(`   ${msg}`));
  } else {
    console.log('✓ All intensity tiers valid');
  }
  
  if (issues.invalidPhase.length > 0) {
    console.log(`⚠️  Invalid Phase (${issues.invalidPhase.length}):`);
    issues.invalidPhase.forEach(msg => console.log(`   ${msg}`));
  } else {
    console.log('✓ All phases valid');
  }
  
  if (issues.emptyMovementPattern.length > 0) {
    console.log(`⚠️  Empty Movement Pattern (${issues.emptyMovementPattern.length}):`);
    issues.emptyMovementPattern.forEach(msg => console.log(`   ${msg}`));
  } else {
    console.log('✓ All movement patterns present');
  }
  
  console.log('\n3️⃣ GENERATING JSON OUTPUT');
  console.log('--------------------------');
  
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2));
  
  console.log(`✓ Written to: ${outputPath}`);
  console.log('');
  console.log('========================================');
  console.log(`Decision dataset built successfully: ${exercises.length} exercises`);
  console.log('========================================');
}

main();
