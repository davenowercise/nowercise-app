import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Clock, Repeat } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps?: number;
  duration?: string;
  youtubeId: string;
  description?: string;
}

interface DayPlan {
  day: string;
  exercises: Exercise[];
}

const weeklyPlan: DayPlan[] = [
  {
    day: "Monday",
    exercises: [
      {
        name: "Gentle Shoulder Rolls",
        sets: 2,
        reps: 10,
        youtubeId: "fXyIuhe7jIQ", // Example: shoulder roll exercise
        description: "Gentle circular movements to mobilize shoulder joints"
      },
      {
        name: "Seated Marches",
        sets: 3,
        duration: "20 seconds",
        youtubeId: "RyJhT_xZF7E", // Example: seated marching
        description: "Light cardio movement while seated for comfort"
      }
    ]
  },
  {
    day: "Tuesday", 
    exercises: [
      {
        name: "Resistance Band Pulls",
        sets: 2,
        reps: 12,
        youtubeId: "ub9omH7NILo", // Example: resistance band exercise
        description: "Upper body strengthening with controlled resistance"
      },
      {
        name: "Wall Sit Hold",
        sets: 2,
        duration: "20 seconds",
        youtubeId: "y-wV4Venusw", // Example: wall sit
        description: "Isometric leg strengthening exercise"
      }
    ]
  },
  {
    day: "Wednesday",
    exercises: [
      {
        name: "Gentle Stretching Sequence",
        sets: 1,
        duration: "10 minutes",
        youtubeId: "sTANio_2E0Q", // Example: gentle stretching
        description: "Full body flexibility and relaxation routine"
      }
    ]
  },
  {
    day: "Thursday",
    exercises: [
      {
        name: "Chair-Based Yoga",
        sets: 1,
        duration: "15 minutes",
        youtubeId: "KV6Af5pAx3A", // Example: chair yoga
        description: "Gentle yoga movements adapted for seated practice"
      },
      {
        name: "Breathing Exercises",
        sets: 3,
        duration: "2 minutes",
        youtubeId: "tybOi4hjZFQ", // Example: breathing exercise
        description: "Deep breathing techniques for relaxation and energy"
      }
    ]
  },
  {
    day: "Friday",
    exercises: [
      {
        name: "Light Walking Program",
        sets: 1,
        duration: "10-15 minutes",
        youtubeId: "mNmL_8yogOE", // Example: walking exercise
        description: "Low-impact cardiovascular activity at your own pace"
      },
      {
        name: "Balance Training",
        sets: 2,
        reps: 8,
        youtubeId: "4_LhWPqmFUg", // Example: balance exercises
        description: "Simple balance exercises to improve stability"
      }
    ]
  }
];

const ClientProgrammePage = () => {
  return (
    <div className="container max-w-4xl mx-auto p-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">🧘 Nowercise Client Programme</h1>
        <p className="text-gray-700 mb-4">
          Your personalized weekly exercise program designed specifically for your current fitness level and treatment phase.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Remember:</strong> Listen to your body and adjust intensity as needed. 
            Stop any exercise if you feel pain or unusual discomfort.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {weeklyPlan.map((dayPlan, dayIndex) => (
          <Card key={dayIndex} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center">
                <span className="text-xl font-bold">{dayPlan.day}</span>
                <span className="ml-auto text-sm opacity-90">
                  {dayPlan.exercises.length} exercise{dayPlan.exercises.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {dayPlan.exercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="border-l-4 border-blue-200 pl-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {exercise.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Repeat className="h-4 w-4 mr-1" />
                          <span>{exercise.sets} sets</span>
                        </div>
                        {exercise.reps && (
                          <div className="flex items-center">
                            <span>{exercise.reps} reps</span>
                          </div>
                        )}
                        {exercise.duration && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{exercise.duration}</span>
                          </div>
                        )}
                      </div>
                      {exercise.description && (
                        <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${exercise.youtubeId}`}
                          title={exercise.name}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-info-panel p-6 rounded-lg border border-info-border">
        <h3 className="font-semibold text-action-blue mb-2">Program Notes</h3>
        <ul className="text-sm text-accent-blue space-y-1">
          <li>• Start with shorter durations and fewer repetitions if needed</li>
          <li>• Rest days (Saturday & Sunday) are important for recovery</li>
          <li>• Stay hydrated and take breaks as needed</li>
          <li>• Contact your exercise specialist if you have any concerns</li>
        </ul>
      </div>
    </div>
  );
};

export default ClientProgrammePage;