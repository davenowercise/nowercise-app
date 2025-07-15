import fs from 'fs';
import { db } from './db';
import { exercises } from '@shared/schema';

interface CSVVideoData {
  title: string;
  videoId: string;
  url: string;
}

/**
 * Parse CSV file and return video data
 */
export function parseCSVVideos(filePath: string): CSVVideoData[] {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.split('\n');
    const videos: CSVVideoData[] = [];

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const [title, videoId, url] = line.split(',');
        if (title && videoId && url) {
          videos.push({
            title: title.trim(),
            videoId: videoId.trim(),
            url: url.trim()
          });
        }
      }
    }

    return videos;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

/**
 * Import CSV videos into the database as exercises
 */
export async function importCSVVideos(filePath: string = 'youtube_video_list.csv'): Promise<{
  imported: number;
  failed: number;
  errors: string[];
}> {
  const videos = parseCSVVideos(filePath);
  const errors: string[] = [];
  let imported = 0;
  let failed = 0;

  console.log(`Starting import of ${videos.length} videos...`);

  for (const video of videos) {
    try {
      // Check if exercise already exists
      const existingExercise = await db.query.exercises.findFirst({
        where: (exercises, { eq }) => eq(exercises.videoUrl, video.url)
      });

      if (existingExercise) {
        console.log(`Exercise already exists: ${video.title}`);
        continue;
      }

      // Create exercise from video data
      const exerciseData = {
        name: video.title,
        description: `Exercise demonstration video: ${video.title}`,
        videoUrl: video.url,
        energyLevel: inferEnergyLevel(video.title),
        cancerAppropriate: ['all'] as any,
        treatmentPhases: ['pre-treatment', 'during-treatment', 'post-treatment', 'survivorship'] as any,
        bodyFocus: inferBodyFocus(video.title),
        benefits: inferBenefits(video.title),
        movementType: inferMovementType(video.title),
        equipment: inferEquipment(video.title),
        duration: 300, // 5 minutes default
        instructionSteps: [`Follow along with the video demonstration for ${video.title}`] as any,
        precautions: "Consult with your healthcare provider before starting any exercise program. Stop if you experience pain or discomfort.",
        createdBy: 'csv-import'
      };

      await db.insert(exercises).values(exerciseData);
      imported++;
      console.log(`Imported: ${video.title}`);

    } catch (error) {
      failed++;
      const errorMsg = `Failed to import ${video.title}: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }
  }

  console.log(`Import complete. Imported: ${imported}, Failed: ${failed}`);
  return { imported, failed, errors };
}

/**
 * Helper functions to infer exercise properties from title
 */
function inferEnergyLevel(title: string): number {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('gentle') || lowerTitle.includes('breathing') || lowerTitle.includes('stretch')) {
    return 1; // Very low intensity
  } else if (lowerTitle.includes('walk') || lowerTitle.includes('mobility') || lowerTitle.includes('band')) {
    return 2; // Low intensity
  } else if (lowerTitle.includes('squat') || lowerTitle.includes('lunge') || lowerTitle.includes('press')) {
    return 3; // Moderate intensity
  } else if (lowerTitle.includes('jump') || lowerTitle.includes('sprint') || lowerTitle.includes('explosive')) {
    return 4; // High intensity
  }
  
  return 2; // Default to low intensity
}

function inferBodyFocus(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const bodyFocus: string[] = [];
  
  if (lowerTitle.includes('upper') || lowerTitle.includes('arm') || lowerTitle.includes('chest') || 
      lowerTitle.includes('shoulder') || lowerTitle.includes('back') || lowerTitle.includes('bicep')) {
    bodyFocus.push('upper-body');
  }
  if (lowerTitle.includes('lower') || lowerTitle.includes('leg') || lowerTitle.includes('squat') || 
      lowerTitle.includes('lunge') || lowerTitle.includes('glute') || lowerTitle.includes('quad')) {
    bodyFocus.push('lower-body');
  }
  if (lowerTitle.includes('core') || lowerTitle.includes('ab') || lowerTitle.includes('abdominal')) {
    bodyFocus.push('core');
  }
  if (lowerTitle.includes('cardio') || lowerTitle.includes('walk') || lowerTitle.includes('run')) {
    bodyFocus.push('cardio');
  }
  
  return bodyFocus.length > 0 ? bodyFocus : ['full-body'];
}

function inferBenefits(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const benefits: string[] = [];
  
  if (lowerTitle.includes('strength') || lowerTitle.includes('muscle') || lowerTitle.includes('power')) {
    benefits.push('strength');
  }
  if (lowerTitle.includes('balance') || lowerTitle.includes('stability')) {
    benefits.push('balance');
  }
  if (lowerTitle.includes('flexibility') || lowerTitle.includes('stretch') || lowerTitle.includes('mobility')) {
    benefits.push('flexibility');
  }
  if (lowerTitle.includes('cardio') || lowerTitle.includes('endurance')) {
    benefits.push('cardiovascular');
  }
  
  return benefits.length > 0 ? benefits : ['strength', 'flexibility'];
}

function inferMovementType(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('stretch') || lowerTitle.includes('mobility')) {
    return 'flexibility';
  } else if (lowerTitle.includes('cardio') || lowerTitle.includes('walk') || lowerTitle.includes('run')) {
    return 'cardiovascular';
  } else if (lowerTitle.includes('balance') || lowerTitle.includes('stability')) {
    return 'balance';
  }
  
  return 'strength';
}

function inferEquipment(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const equipment: string[] = [];
  
  if (lowerTitle.includes('band') || lowerTitle.includes('resistance')) {
    equipment.push('resistance-band');
  }
  if (lowerTitle.includes('dumbbell') || lowerTitle.includes('weight')) {
    equipment.push('dumbbells');
  }
  if (lowerTitle.includes('barbell')) {
    equipment.push('barbell');
  }
  if (lowerTitle.includes('bodyweight') || lowerTitle.includes('assisted')) {
    equipment.push('bodyweight');
  }
  if (lowerTitle.includes('ball') || lowerTitle.includes('wheel')) {
    equipment.push('exercise-ball');
  }
  if (lowerTitle.includes('chair') || lowerTitle.includes('box')) {
    equipment.push('chair');
  }
  
  return equipment.length > 0 ? equipment : ['bodyweight'];
}