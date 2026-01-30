import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoOverlay } from "@/components/ui/video-overlay";
import { Play, ArrowLeft, Dumbbell, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface Exercise {
  id: number;
  name: string;
  videoUrl: string | null;
  description?: string;
  tags?: Record<string, unknown>;
}

const TEST_EXERCISE_IDS = [434, 435];

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

      <VideoOverlay
        isOpen={isVideoOpen}
        onClose={handleCloseVideo}
        videoUrl={selectedExercise?.videoUrl}
        title={selectedExercise?.name}
        fallbackMessage={selectedExercise?.description || "Follow the written instructions for now."}
      />
    </div>
  );
}
