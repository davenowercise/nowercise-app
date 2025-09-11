/**
 * YouTube API integration for fetching exercise videos from the channel
 * Restricted to approved channels only for content control
 */

// Configuration for allowed YouTube channel
const APPROVED_CHANNEL_ID = "UCW9ibzJH9xWAm922rVnHZtg"; // Your approved YouTube channel ID

/**
 * Validate if a YouTube URL belongs to the approved channel
 */
export async function validateChannelVideo(videoUrl: string): Promise<boolean> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    console.warn("YouTube API key missing - skipping channel validation");
    return false;
  }

  try {
    // Extract video ID from URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoUrl.match(youtubeRegex);
    
    if (!match || !match[1]) {
      console.log("Invalid YouTube URL format:", videoUrl);
      return false;
    }
    
    const videoId = match[1];
    
    // Use YouTube API to get video details including channel ID
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoId}&part=snippet`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error("YouTube API error:", response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log("Video not found or private:", videoId);
      return false;
    }
    
    const channelId = data.items[0].snippet.channelId;
    const isApproved = channelId === APPROVED_CHANNEL_ID;
    
    if (!isApproved) {
      console.log(`Video ${videoId} from unauthorized channel: ${channelId}. Expected: ${APPROVED_CHANNEL_ID}`);
    }
    
    return isApproved;
    
  } catch (error) {
    console.error("Error validating YouTube channel:", error);
    return false;
  }
}

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
    console.error("YouTube API key missing from environment");
    throw new Error("YouTube API key not found in environment variables");
  }

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=50`;

  try {
    console.log("Fetching YouTube videos from channel:", channelId);
    console.log("Using API URL:", url.replace(API_KEY, "***API_KEY***"));
    
    const response = await fetch(url);
    console.log("YouTube API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("YouTube API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      
      // Parse error data if it's JSON
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error?.message) {
          throw new Error(`YouTube API Error: ${errorJson.error.message}`);
        }
      } catch (parseError) {
        // If not JSON, use the raw error
      }
      
      throw new Error(`YouTube API request failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data: YouTubeSearchResponse = await response.json();
    console.log("YouTube API response data:", {
      totalResults: data.items?.length || 0,
      hasItems: !!data.items
    });
    
    if (!data.items || data.items.length === 0) {
      console.log("No videos found in channel response");
      return [];
    }
    
    const videos = data.items.map(item => {
      console.log("Processing video:", item.snippet.title);
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || "",
        publishedAt: item.snippet.publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      };
    });

    console.log(`Successfully fetched ${videos.length} videos from YouTube channel`);
    return videos;

  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
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
    // Set optional fields with proper defaults
    cancerAppropriate: ['General'],
    treatmentPhases: ['Pre-Treatment', 'During Treatment', 'Post-Treatment'],
    bodyFocus: ['Full Body'],
    benefits: ['Improved fitness'],
    equipment: [],
    duration: 15,
    instructionSteps: [`Watch the video: ${video.title}`],
    modifications: {},
    precautions: 'Consult your healthcare provider before starting any exercise program.',
    citations: []
  };
}