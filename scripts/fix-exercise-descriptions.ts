import { db } from '../server/db/index.js';
import { exercises } from '../shared/schema.js';
import { eq, like } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate complete exercise description
async function generateExerciseDescription(exerciseName: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a certified exercise physiologist specializing in cancer recovery and adaptive fitness. Generate a clear, step-by-step exercise description for cancer patients and survivors. 

Requirements:
- Provide 4-6 numbered steps
- Focus on proper form and safety
- Include modifications for different fitness levels
- Use clear, encouraging language
- Emphasize controlled movements and breathing
- Consider limitations that cancer patients might have
- Keep each step concise but informative`
        },
        {
          role: "user",
          content: `Generate a complete exercise description for: "${exerciseName}"`
        }
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error(`Error generating description for ${exerciseName}:`, error);
    return '';
  }
}

// Main function to fix all truncated descriptions
async function fixTruncatedDescriptions() {
  try {
    console.log('🔍 Finding exercises with truncated descriptions...');
    
    // Get all exercises with truncated descriptions
    const truncatedExercises = await db
      .select()
      .from(exercises)
      .where(like(exercises.description, '%...'));

    console.log(`📋 Found ${truncatedExercises.length} exercises with truncated descriptions`);

    if (truncatedExercises.length === 0) {
      console.log('✅ No truncated descriptions found!');
      return;
    }

    console.log('🤖 Generating complete descriptions using AI...');
    
    let updated = 0;
    let failed = 0;

    for (const exercise of truncatedExercises) {
      try {
        console.log(`📝 Processing: ${exercise.name}`);
        
        const completeDescription = await generateExerciseDescription(exercise.name);
        
        if (completeDescription) {
          await db
            .update(exercises)
            .set({ description: completeDescription })
            .where(eq(exercises.id, exercise.id));
          
          updated++;
          console.log(`✅ Updated: ${exercise.name}`);
        } else {
          failed++;
          console.log(`❌ Failed to generate description for: ${exercise.name}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        failed++;
        console.error(`❌ Error processing ${exercise.name}:`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully updated: ${updated} exercises`);
    console.log(`❌ Failed: ${failed} exercises`);
    console.log(`📋 Total processed: ${truncatedExercises.length} exercises`);

  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixTruncatedDescriptions()
    .then(() => {
      console.log('🎉 Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { fixTruncatedDescriptions };