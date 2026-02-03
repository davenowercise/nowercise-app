import { X, Play } from "lucide-react";
import { cleanYoutubeUrl } from "@/lib/utils";

interface VideoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
  title?: string;
  fallbackMessage?: string;
}

export function VideoOverlay({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title,
  fallbackMessage = "Follow the written instructions for now."
}: VideoOverlayProps) {
  if (!isOpen) return null;

  const embedUrl = videoUrl ? cleanYoutubeUrl(videoUrl) : null;
  
  if (!embedUrl && videoUrl) {
    console.warn(`Missing or invalid video_url: ${videoUrl}`);
  } else if (!videoUrl) {
    console.warn(`Missing video_url for: ${title || 'Unknown exercise'}`);
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: '#0B1220' }}
    >
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <h2 className="text-white/80 text-sm font-medium truncate max-w-[80%]">
          {title || ''}
        </h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close video"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div 
          className="w-full max-w-4xl relative"
          style={{ aspectRatio: '16 / 9' }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title || "Exercise video"}
              className="absolute inset-0 w-full h-full block"
              style={{ border: 0 }}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ backgroundColor: '#1a2332' }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#2a3444' }}
              >
                <Play className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white font-medium text-lg mb-2">
                Demo video coming soon
              </h3>
              <p className="text-white/50 text-sm text-center max-w-xs px-4">
                {fallbackMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
