/**
 * YouTube API integration for fetching exercise videos from the channel
 */

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  videoUrl: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
      publishedAt: string;
    };
  }>;
}

/**
 * Fetch videos from the specified YouTube channel
 */
export async function fetchChannelVideos(channelId: string = "UCW9ibzJH9xWAm922rVnHZtg"): Promise<YouTubeVideo[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    throw new Error("YouTube API key not found in environment variables");
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=50`;

  try {
    console.log("Fetching YouTube videos from channel:", channelId);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("YouTube API Error:", response.status, errorData);
      throw new Error(`YouTube API request failed: ${response.status} ${response.statusText}`);
    }

    const data: YouTubeSearchResponse = await response.json();
    
    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      publishedAt: item.snippet.publishedAt,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    console.log(`Successfully fetched ${videos.length} videos from YouTube channel`);
    return videos;

  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw error;
  }
}

/**
 * Convert YouTube video data to exercise format
 */
export function convertVideoToExercise(video: YouTubeVideo, userId: string) {
  // Extract energy level from title or default to 3
  let energyLevel = 3;
  const title = video.title.toLowerCase();
  
  if (title.includes('gentle') || title.includes('light') || title.includes('easy')) {
    energyLevel = 2;
  } else if (title.includes('intense') || title.includes('hard') || title.includes('advanced')) {
    energyLevel = 4;
  } else if (title.includes('moderate') || title.includes('medium')) {
    energyLevel = 3;
  }

  // Determine movement type based on title
  let movementType = null;
  if (title.includes('squat') || title.includes('deadlift') || title.includes('press') || title.includes('curl')) {
    movementType = 'Strength';
  } else if (title.includes('walk') || title.includes('cardio')) {
    movementType = 'Cardio';
  } else if (title.includes('stretch') || title.includes('mobility')) {
    movementType = 'Flexibility';
  }

  return {
    name: video.title,
    description: video.description || `Exercise video: ${video.title}`,
    energyLevel,
    videoUrl: video.videoUrl,
    imageUrl: video.thumbnailUrl,
    movementType,
    createdBy: userId,
    // Set optional fields to null
    cancerAppropriate: null,
    treatmentPhases: null,
    bodyFocus: null,
    benefits: null,
    equipment: null,
    duration: null,
    instructionSteps: null,
    modifications: null,
    precautions: null,
    citations: null
  };
}