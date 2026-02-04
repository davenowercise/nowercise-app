import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Play, Video } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { cleanYoutubeUrl, isYouTubeUrl } from '@/lib/utils';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  className?: string;
  thumbnailUrl?: string;
}

// Check if URL is an HLS stream (.m3u8)
const isHlsUrl = (url?: string): boolean => {
  return !!url && url.includes('.m3u8');
};

/**
 * A flexible video player component that supports multiple sources
 * - HLS streams (Bunny CDN, etc.) via hls.js
 * - YouTube videos
 * - Vimeo videos
 * - Direct video URLs
 * - Provides fallbacks when videos can't be loaded
 */
export function VideoPlayer({ videoUrl, title, className, thumbnailUrl }: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Handle HLS stream setup
  useEffect(() => {
    if (!videoUrl || !isHlsUrl(videoUrl) || !videoRef.current) return;

    const video = videoRef.current;

    // Safari supports HLS natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      return;
    }

    // Use hls.js for other browsers
    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError('Failed to load video stream');
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else {
      setError('HLS streaming not supported in this browser');
    }
  }, [videoUrl]);

  // Early return if no video URL is provided
  if (!videoUrl) {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-gray-100 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <Video className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-muted-foreground">No video available for this exercise</p>
        </CardContent>
      </Card>
    );
  }
  
  // Function to extract video ID and render appropriate player
  const renderVideoPlayer = () => {
    // Handle HLS streams (.m3u8) - Bunny CDN and similar
    if (isHlsUrl(videoUrl)) {
      return (
        <div className={`videoCard ${className || ''}`}>
          <div className="videoFrame">
            <video
              ref={videoRef}
              className="videoEl"
              controls
              playsInline
              preload="metadata"
              onError={() => setError('Failed to load video')}
            />
          </div>
        </div>
      );
    }

    // Handle YouTube videos
    if (isYouTubeUrl(videoUrl)) {
      const embedUrl = cleanYoutubeUrl(videoUrl);
      if (!embedUrl) return renderFallback();
      
      return (
        <div className={`videoCard ${className || ''}`}>
          <div className="videoFrame">
            <iframe
              src={embedUrl}
              title={title || "Exercise video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              onError={() => setError('Failed to load YouTube video')}
            />
          </div>
        </div>
      );
    }
    
    // Handle Vimeo videos
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[1]) {
      const videoId = vimeoMatch[1];
      
      if (error) {
        return renderFallback();
      }
      
      return (
        <div className={`videoCard ${className || ''}`}>
          <div className="videoFrame">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              onError={() => setError('Failed to load Vimeo video.')}
            />
          </div>
        </div>
      );
    }
    
    // Handle direct video URLs
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <div className={`videoCard ${className || ''}`}>
          <div className="videoFrame">
            <video 
              className="videoEl" 
              controls
              playsInline
              preload="metadata"
              onError={() => setError('Failed to load video')}
            >
              <source src={videoUrl} type={`video/${videoUrl.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      );
    }
    
    // Fallback for unsupported video URLs
    return renderFallback();
  };
  
  // Render fallback UI when video can't be loaded
  const renderFallback = () => {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-gray-100 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          {error ? (
            <>
              <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
              <p className="text-muted-foreground mb-2">{error}</p>
            </>
          ) : (
            <Video className="h-12 w-12 text-gray-400 mb-2" />
          )}
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.open(videoUrl, '_blank')}
          >
            <Play className="h-4 w-4" />
            Open video in new tab
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  // Show appropriate content based on state
  if (loading) {
    return (
      <div className={`aspect-video flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="animate-pulse">Loading video...</div>
      </div>
    );
  }
  
  return renderVideoPlayer();
}
