import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Timer, Target } from "lucide-react";
import { useState } from "react";

// Exercise data from the CSV
const workoutExercises = [
  {
    id: 1,
    name: "Goblet Squat",
    category: "Squat",
    videoUrl: "https://www.youtube.com/watch?v=biOKxrfbdlY",
    videoId: "biOKxrfbdlY",
    tags: ["band", "lower body"],
    instructions: "Stand with feet shoulder-width apart, hold weight at chest level, squat down keeping chest up, return to standing.",
    energyLevel: 3,
    equipment: "Resistance Band"
  },
  {
    id: 2,
    name: "Band-Resisted Pushup",
    category: "Push",
    videoUrl: "https://www.youtube.com/watch?v=u7QnowXDjYE",
    videoId: "u7QnowXDjYE",
    tags: ["band", "upper body"],
    instructions: "Place resistance band across your back, perform standard pushup with added resistance from the band.",
    energyLevel: 3,
    equipment: "Resistance Band"
  },
  {
    id: 3,
    name: "Banded Pull-Down",
    category: "Pull", 
    videoUrl: "https://www.youtube.com/watch?v=FwkJXHGYk8o",
    videoId: "FwkJXHGYk8o",
    tags: ["band", "upper body"],
    instructions: "Secure band overhead, pull down with controlled motion engaging your lats and upper back muscles.",
    energyLevel: 3,
    equipment: "Resistance Band"
  },
  {
    id: 4,
    name: "7 MIN DAILY ABS WORKOUT",
    category: "Core",
    videoUrl: "https://www.youtube.com/watch?v=UhgEocboADQ",
    videoId: "UhgEocboADQ",
    tags: ["core", "bodyweight"],
    instructions: "Complete 7-minute core routine targeting all abdominal muscles with bodyweight exercises.",
    energyLevel: 3,
    equipment: "Bodyweight"
  }
];

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (videoId: string) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Helper function to get energy level color
const getEnergyLevelColor = (level: number) => {
  switch(level) {
    case 1: return "bg-green-100 text-green-800";
    case 2: return "bg-blue-100 text-blue-800";
    case 3: return "bg-yellow-100 text-yellow-800";
    case 4: return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Helper function to get energy level text
const getEnergyLevelText = (level: number) => {
  switch(level) {
    case 1: return "Gentle";
    case 2: return "Low";
    case 3: return "Moderate";
    case 4: return "High";
    default: return "Unknown";
  }
};

interface ExerciseCardProps {
  exercise: typeof workoutExercises[0];
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleVideoClick = () => {
    window.open(exercise.videoUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Video Thumbnail */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {!imageError ? (
            <img 
              src={getYouTubeThumbnail(exercise.videoId)}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              onClick={handleVideoClick}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              <Play className="h-6 w-6 mr-2" />
              Watch Video
            </Button>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {exercise.category}
          </Badge>
        </div>
        
        {/* Energy Level Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={getEnergyLevelColor(exercise.energyLevel)}>
            {getEnergyLevelText(exercise.energyLevel)}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{exercise.name}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>{exercise.equipment}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {exercise.tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Instructions */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {exercise.instructions}
        </p>
        
        {/* Action Button */}
        <Button 
          onClick={handleVideoClick}
          variant="outline" 
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Video
        </Button>
      </CardContent>
    </Card>
  );
}

export function FullBodyWorkout() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Full Body Workout</h1>
        <p className="text-gray-600 mb-4">
          A complete workout targeting all major muscle groups with 4 essential movement patterns
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span>~20-30 minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>Moderate Intensity</span>
          </div>
        </div>
      </div>
      
      {/* Workout Structure */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Workout Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-blue-600">1. Squat</div>
            <div className="text-gray-600">Lower Body Power</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">2. Push</div>
            <div className="text-gray-600">Upper Body Push</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">3. Pull</div>
            <div className="text-gray-600">Upper Body Pull</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">4. Core</div>
            <div className="text-gray-600">Core Stability</div>
          </div>
        </div>
      </div>
      
      {/* Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {workoutExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
      
      {/* Workout Notes */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Workout Notes</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Perform 2-3 sets of each exercise</li>
          <li>• Rest 30-60 seconds between sets</li>
          <li>• Focus on proper form over speed</li>
          <li>• Modify intensity based on your fitness level</li>
          <li>• Stay hydrated throughout the workout</li>
        </ul>
      </div>
    </div>
  );
}