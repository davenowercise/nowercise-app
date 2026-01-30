import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, ArrowLeft, Dumbbell, Activity, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface Exercise {
  id: number;
  name: string;
  videoUrl: string | null;
  description?: string;
  tags?: Record<string, unknown>;
}

const TEST_EXERCISE_IDS = [434, 435];

function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.includes("v=") 
    ? url.split("v=")[1]?.split("&")[0] 
    : url.split("/").pop();
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&playsinline=1`;
}

export default function VideoTestRoutine() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises', 'video-test'],
    queryFn: async () => {
      const results = await Promise.all(
        TEST_EXERCISE_IDS.map(async (id) => {
          const res = await fetch(`/api/exercises/${id}?demo=true`);
          if (!res.ok) return null;
          return res.json();
        })
      );
      return results.filter(Boolean);
    }
  });

  const handleWatchDemo = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsVideoOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoOpen(false);
    setSelectedExercise(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-info-panel to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/?demo=true">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-action-blue">Video Test Routine</h1>
        </div>

        <Card className="mb-6 border-info-border">
          <CardHeader className="bg-info-panel border-b border-info-border">
            <CardTitle className="flex items-center gap-2 text-action-blue">
              <Dumbbell className="h-5 w-5" />
              Video Test Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-action-blue mb-2" />
                <p className="text-accent-blue">Loading exercises from database...</p>
              </div>
            ) : !exercises?.length ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No exercises found. Run the import script first.</p>
              </div>
            ) : (
              <div className="divide-y divide-info-border">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-4 hover:bg-info-panel/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-info-panel flex items-center justify-center border border-info-border">
                        <span className="text-action-blue font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{exercise.name}</p>
                        <p className="text-sm text-accent-blue">
                          {exercise.videoUrl ? "Video available" : "Video pending"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleWatchDemo(exercise)}
                      className="bg-action-blue hover:bg-action-blue-hover"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Demo
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-info-panel border border-info-border rounded-lg p-4">
          <h3 className="font-semibold text-action-blue mb-2">Test Purpose</h3>
          <p className="text-sm text-accent-blue">
            This page confirms the full video pipeline works: Routine → Exercise → video_url → video player.
            Click "Watch Demo" to open each exercise video in an embedded player.
          </p>
        </div>
      </div>

      <Dialog open={isVideoOpen} onOpenChange={handleCloseVideo}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px] p-0 gap-0 overflow-hidden rounded-lg bg-black border-0 [&>button]:text-white [&>button]:hover:bg-white/20">
          <DialogHeader className="px-4 py-3 bg-gray-900">
            <DialogTitle className="text-white text-sm font-medium">
              {selectedExercise?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            {selectedExercise && selectedExercise.videoUrl ? (
              <iframe
                src={getYouTubeEmbedUrl(selectedExercise.videoUrl)}
                className="absolute inset-0 w-full h-full block"
                style={{ border: 0 }}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : selectedExercise ? (
              (() => {
                console.warn(`Missing video_url for exercise: ${selectedExercise.name}`);
                return (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center p-6">
                      <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3 border border-gray-700">
                        <Activity className="w-7 h-7 text-gray-400" />
                      </div>
                      <h3 className="font-medium text-white mb-1">Demo video coming soon</h3>
                      <p className="text-gray-400 text-sm max-w-xs">
                        {selectedExercise.description || "Follow the written instructions for now."}
                      </p>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
