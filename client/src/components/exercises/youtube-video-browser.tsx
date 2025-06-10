import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Video, 
  Search, 
  ExternalLink, 
  Clock, 
  Calendar,
  Eye,
  Play
} from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  viewCount: string;
  url: string;
}

interface YouTubeVideoBrowserProps {
  onVideoSelect: (videoUrl: string, videoTitle: string) => void;
  selectedVideoUrl?: string;
}

export function YouTubeVideoBrowser({ onVideoSelect, selectedVideoUrl }: YouTubeVideoBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelId, setChannelId] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sample video data for demonstration - replace with actual YouTube API integration
  const sampleVideos: YouTubeVideo[] = [
    {
      id: "aclHkVaku9U",
      title: "Seated Chest Press for Cancer Patients",
      description: "Safe and effective chest exercise for cancer patients during treatment",
      thumbnail: `https://img.youtube.com/vi/aclHkVaku9U/mqdefault.jpg`,
      duration: "2:45",
      publishedAt: "2024-01-15",
      viewCount: "1,234",
      url: "https://www.youtube.com/watch?v=aclHkVaku9U"
    },
    {
      id: "VmB1G1K7v94",
      title: "Gentle Squats - Cancer Exercise Therapy",
      description: "Modified squat exercises for cancer patients",
      thumbnail: `https://img.youtube.com/vi/VmB1G1K7v94/mqdefault.jpg`,
      duration: "3:12",
      publishedAt: "2024-01-10",
      viewCount: "987",
      url: "https://www.youtube.com/watch?v=VmB1G1K7v94"
    },
    {
      id: "3NXv0Nany-Q",
      title: "Glute Bridge Exercise for Recovery",
      description: "Safe glute strengthening exercise for cancer recovery",
      thumbnail: `https://img.youtube.com/vi/3NXv0Nany-Q/mqdefault.jpg`,
      duration: "2:30",
      publishedAt: "2024-01-08",
      viewCount: "756",
      url: "https://www.youtube.com/watch?v=3NXv0Nany-Q"
    }
  ];

  // Filter videos based on search term
  const filteredVideos = videos.length > 0 
    ? videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sampleVideos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Handle video selection
  const handleVideoSelect = (video: YouTubeVideo) => {
    onVideoSelect(video.url, video.title);
    setIsOpen(false);
  };

  // Load videos from channel using YouTube API
  const loadChannelVideos = async () => {
    if (!channelId) {
      setError("Please enter your YouTube channel ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/youtube/channel/${channelId}/videos?demo=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch channel videos");
      }
      
      const channelVideos = await response.json();
      setVideos(channelVideos.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
        publishedAt: video.publishedAt,
        viewCount: video.viewCount.toString(),
        url: video.url
      })));
    } catch (err) {
      console.error("YouTube channel error:", err);
      setError(`Failed to load channel videos: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Video className="h-4 w-4 mr-2" />
          Browse Your YouTube Videos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            YouTube Video Browser
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Channel Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Channel Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  <strong>Important:</strong> Only public videos will appear. Make sure your videos are set to "Public" not "Private" or "Unlisted".
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="channelId" className="text-xs">YouTube Channel ID</Label>
                    <Input
                      id="channelId"
                      value={channelId}
                      onChange={(e) => setChannelId(e.target.value)}
                      placeholder="UCxxxxxxxxxxxxxxxxxx"
                      className="text-sm"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Find your channel ID in YouTube Studio → Settings → Channel
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={loadChannelVideos} disabled={isLoading} size="sm">
                      {isLoading ? "Loading..." : "Load Videos"}
                    </Button>
                  </div>
                </div>
                {error && (
                  <div className="text-sm text-red-600 mt-2">{error}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your videos..."
              className="pl-10"
            />
          </div>

          {/* Video Grid */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedVideoUrl === video.url ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-15 object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="absolute bottom-1 right-1 text-xs px-1 py-0"
                        >
                          {video.duration}
                        </Badge>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {video.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.viewCount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(video.url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No videos found matching your search.</p>
                {!channelId && (
                  <p className="text-sm mt-2">Enter your YouTube channel ID above to load your videos.</p>
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <Card className="bg-muted">
            <CardContent className="p-3">
              <div className="text-sm space-y-2">
                <div className="font-medium">How to connect your YouTube channel:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to YouTube Studio → Settings → Channel</li>
                  <li>Copy your Channel ID (starts with UC...)</li>
                  <li>Paste it above and click "Load Videos"</li>
                  <li>Select videos to add to your exercise library</li>
                </ol>
                <div className="text-xs text-muted-foreground mt-2">
                  Note: YouTube API integration requires API key configuration.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}