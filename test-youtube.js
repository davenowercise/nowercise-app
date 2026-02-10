// Test YouTube API directly using native fetch
async function testYouTubeAPI() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const channelId = "UCW9ibzJH9xWAm922rVnHZtg";
  
  console.log("Testing YouTube API with key:", API_KEY ? "Present" : "Missing");
  
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=5`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error("API Error:", data);
    } else {
      console.log(`Found ${data.items?.length || 0} videos`);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

if (process.env.NODE_ENV !== "test") {
  testYouTubeAPI();
}