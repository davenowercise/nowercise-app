import fs from 'fs';
import { db } from './db';
import { exercises } from '@shared/schema';

interface CSVVideoData {
  title: string;
  videoId: string;
  url: string;
  tags?: string;
}

/**
 * Parse CSV file and return video data
 */
export function parseCSVVideos(filePath: string): CSVVideoData[] {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.split('\n');
    const videos: CSVVideoData[] = [];

    // Parse header to understand structure
    const headerLine = lines[0]?.trim();
    const headers = headerLine ? headerLine.split(',').map(h => h.trim().toLowerCase()) : [];
    const hasTagsColumn = headers.includes('tags') || headers.includes('tag');

    console.log('CSV Headers:', headers);
    console.log('Has tags column:', hasTagsColumn);

    // Skip header row (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const columns = line.split(',');
        
        if (hasTagsColumn) {
          // Handle CSV with tags column
          const title = columns[0]?.trim();
          const videoId = columns[1]?.trim();
          const url = columns[2]?.trim();
          const tags = columns[3]?.trim();
          
          if (title && videoId && url) {
            videos.push({
              title,
              videoId,
              url,
              tags
            });
          }
        } else {
          // Handle CSV without tags column (original format)
          const title = columns[0]?.trim();
          const videoId = columns[1]?.trim();
          const url = columns[2]?.trim();
          
          if (title && videoId && url) {
            videos.push({
              title,
              videoId,
              url
            });
          }
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
        energyLevel: inferEnergyLevel(video.title, video.tags),
        cancerAppropriate: ['all'] as any,
        treatmentPhases: ['pre-treatment', 'during-treatment', 'post-treatment', 'survivorship'] as any,
        bodyFocus: inferBodyFocus(video.title, video.tags),
        benefits: inferBenefits(video.title, video.tags),
        movementType: inferMovementType(video.title, video.tags),
        equipment: inferEquipment(video.title, video.tags),
        duration: 300, // 5 minutes default
        instructionSteps: [`Follow along with the video demonstration for ${video.title}`] as any,
        precautions: "Consult with your healthcare provider before starting any exercise program. Stop if you experience pain or discomfort.",
        createdBy: 'demo-user'
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
 * Helper functions to infer exercise properties from title and tags
 */
function inferEnergyLevel(title: string, tags?: string): number {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags?.toLowerCase() || '';
  const combined = `${lowerTitle} ${lowerTags}`;
  
  if (combined.includes('gentle') || combined.includes('breathing') || combined.includes('stretch') || 
      combined.includes('mobility') || combined.includes('tier1') || combined.includes('beginner')) {
    return 1; // Very low intensity
  } else if (combined.includes('walk') || combined.includes('band') || combined.includes('assisted') || 
             combined.includes('tier2') || combined.includes('low')) {
    return 2; // Low intensity
  } else if (combined.includes('squat') || combined.includes('lunge') || combined.includes('press') || 
             combined.includes('tier3') || combined.includes('moderate')) {
    return 3; // Moderate intensity
  } else if (combined.includes('jump') || combined.includes('sprint') || combined.includes('explosive') || 
             combined.includes('tier4') || combined.includes('high') || combined.includes('advanced')) {
    return 4; // High intensity
  }
  
  return 2; // Default to low intensity
}

function inferBodyFocus(title: string, tags?: string): string[] {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags?.toLowerCase() || '';
  const combined = `${lowerTitle} ${lowerTags}`;
  const bodyFocus: string[] = [];
  
  if (combined.includes('upper') || combined.includes('arm') || combined.includes('chest') || 
      combined.includes('shoulder') || combined.includes('back') || combined.includes('bicep') ||
      combined.includes('tricep') || combined.includes('row') || combined.includes('pull') ||
      combined.includes('push') || combined.includes('press')) {
    bodyFocus.push('upper-body');
  }
  if (combined.includes('lower') || combined.includes('leg') || combined.includes('squat') || 
      combined.includes('lunge') || combined.includes('glute') || combined.includes('quad') ||
      combined.includes('hip') || combined.includes('thigh') || combined.includes('calf') ||
      combined.includes('hamstring')) {
    bodyFocus.push('lower-body');
  }
  if (combined.includes('core') || combined.includes('ab') || combined.includes('abdominal') ||
      combined.includes('plank') || combined.includes('crunch') || combined.includes('oblique')) {
    bodyFocus.push('core');
  }
  if (combined.includes('cardio') || combined.includes('walk') || combined.includes('run') ||
      combined.includes('aerobic') || combined.includes('endurance')) {
    bodyFocus.push('cardio');
  }
  
  return bodyFocus.length > 0 ? bodyFocus : ['full-body'];
}

function inferBenefits(title: string, tags?: string): string[] {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags?.toLowerCase() || '';
  const combined = `${lowerTitle} ${lowerTags}`;
  const benefits: string[] = [];
  
  if (combined.includes('strength') || combined.includes('muscle') || combined.includes('power') ||
      combined.includes('resistance') || combined.includes('build') || combined.includes('tone')) {
    benefits.push('strength');
  }
  if (combined.includes('balance') || combined.includes('stability') || combined.includes('proprioception')) {
    benefits.push('balance');
  }
  if (combined.includes('flexibility') || combined.includes('stretch') || combined.includes('mobility') ||
      combined.includes('range') || combined.includes('movement')) {
    benefits.push('flexibility');
  }
  if (combined.includes('cardio') || combined.includes('endurance') || combined.includes('aerobic') ||
      combined.includes('heart') || combined.includes('conditioning')) {
    benefits.push('cardiovascular');
  }
  if (combined.includes('functional') || combined.includes('daily') || combined.includes('activities')) {
    benefits.push('functional');
  }
  
  return benefits.length > 0 ? benefits : ['strength', 'flexibility'];
}

function inferMovementType(title: string, tags?: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags?.toLowerCase() || '';
  const combined = `${lowerTitle} ${lowerTags}`;
  
  if (combined.includes('stretch') || combined.includes('mobility') || combined.includes('flexibility')) {
    return 'flexibility';
  } else if (combined.includes('cardio') || combined.includes('walk') || combined.includes('run') ||
             combined.includes('aerobic') || combined.includes('endurance')) {
    return 'cardiovascular';
  } else if (combined.includes('balance') || combined.includes('stability') || combined.includes('proprioception')) {
    return 'balance';
  }
  
  return 'strength';
}

function inferEquipment(title: string, tags?: string): string[] {
  const lowerTitle = title.toLowerCase();
  const lowerTags = tags?.toLowerCase() || '';
  const combined = `${lowerTitle} ${lowerTags}`;
  const equipment: string[] = [];
  
  if (combined.includes('band') || combined.includes('resistance')) {
    equipment.push('resistance-band');
  }
  if (combined.includes('dumbbell') || combined.includes('weight')) {
    equipment.push('dumbbells');
  }
  if (combined.includes('barbell')) {
    equipment.push('barbell');
  }
  if (combined.includes('bodyweight') || combined.includes('assisted') || combined.includes('no equipment')) {
    equipment.push('bodyweight');
  }
  if (combined.includes('ball') || combined.includes('wheel') || combined.includes('stability')) {
    equipment.push('exercise-ball');
  }
  if (combined.includes('chair') || combined.includes('box') || combined.includes('bench')) {
    equipment.push('chair');
  }
  if (combined.includes('cable') || combined.includes('machine')) {
    equipment.push('cable-machine');
  }
  if (combined.includes('foam') || combined.includes('roller')) {
    equipment.push('foam-roller');
  }
  
  return equipment.length > 0 ? equipment : ['bodyweight'];
}