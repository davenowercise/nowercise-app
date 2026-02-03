import React, { useState } from 'react';
import { AlertCircle, Play, Video } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { cleanYoutubeUrl, isBunnyIframeUrl, isYouTubeUrl } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  className?: string;
  thumbnailUrl?: string;
}

/**
 * A flexible video player component that supports multiple sources
 * - YouTube videos
 * - Vimeo videos
 * - Direct video URLs
 * - Provides fallbacks when videos can't be loaded
 */
export function VideoPlayer({ videoUrl, title, className, thumbnailUrl }: VideoPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
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
    // Handle Bunny Stream Direct Play URLs (must be rendered via iframe)
    if (isBunnyIframeUrl(videoUrl)) {
      return (
        <div className={`video-card aspect-video ${className}`}>
          <iframe
            className="w-full h-full"
            src={videoUrl}
            title={title}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setError('Failed to load video')}
          ></iframe>
        </div>
      );
    }

    // Handle YouTube videos
    if (isYouTubeUrl(videoUrl)) {
      const embedUrl = cleanYoutubeUrl(videoUrl);
      if (!embedUrl) return renderFallback();
      
      return (
        <div className={`video-card aspect-video ${className}`}>
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setError('Failed to load YouTube video')}
          ></iframe>
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
        <div className={`aspect-video rounded-md overflow-hidden bg-gray-100 ${className}`}>
          <iframe
            className="w-full h-full"
            src={`https://player.vimeo.com/video/${videoId}`}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => setError('Failed to load Vimeo video. You may need a Vimeo account to view this content.')}
          ></iframe>
        </div>
      );
    }
    
    // Handle direct video URLs
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <div className={`aspect-video rounded-md overflow-hidden bg-gray-100 ${className}`}>
          <video 
            className="w-full h-full" 
            controls 
            onError={() => setError('Failed to load video')}
          >
            <source src={videoUrl} type={`video/${videoUrl.split('.').pop()}`} />
            Your browser does not support the video tag.
          </video>
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