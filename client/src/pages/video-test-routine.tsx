import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, ArrowLeft, Dumbbell } from "lucide-react";
import { Link } from "wouter";

interface Exercise {
  id: number;
  name: string;
  videoUrl: string;
}

const testRoutine = {
  name: "Video Test Routine",
  exercises: [
    {
      id: 1,
      name: "Bicep Curls",
      videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo"
    },
    {
      id: 2,
      name: "Squat",
      videoUrl: "https://www.youtube.com/watch?v=aclHkVaku9U"
    },
    {
      id: 3,
      name: "Shoulder Press",
      videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog"
    }
  ] as Exercise[]
};

function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.includes("v=") 
    ? url.split("v=")[1]?.split("&")[0] 
    : url.split("/").pop();
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

export default function VideoTestRoutine() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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
              {testRoutine.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-info-border">
              {testRoutine.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 hover:bg-info-panel/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-info-panel flex items-center justify-center border border-info-border">
                      <span className="text-action-blue font-semibold">{exercise.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{exercise.name}</p>
                      <p className="text-sm text-accent-blue">Video available</p>
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
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-action-blue">
              {selectedExercise?.name} - Demo Video
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedExercise && (
              <iframe
                src={getYouTubeEmbedUrl(selectedExercise.videoUrl)}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
