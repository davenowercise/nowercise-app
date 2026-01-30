import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Youtube, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SyncResult {
  message: string;
  imported: number;
  total: number;
  failed?: number;
  exercises?: any[];
  failedImports?: any[];
  errors?: string[];
}

function VideoSyncPage() {
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const queryClient = useQueryClient();

  // Get current exercise count
  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['/api/exercises'],
  });

  // YouTube sync mutation
  const youtubeSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/exercises/import-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: 'UCW9ibzJH9xWAm922rVnHZtg' })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync from YouTube');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSyncResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
    },
  });

  // CSV sync mutation
  const csvSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/exercises/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvFile: 'Exercise_Video_List_with_Cleaned_Tags.csv' })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to sync from CSV');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setSyncResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/exercises'] });
    },
  });

  const exerciseCount = exercises?.length || 0;
  const videoExercises = exercises?.filter((ex: any) => ex.videoUrl)?.length || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">YouTube Video Sync Manager</h1>
        
        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5" />
              Current Exercise Library Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exercisesLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading exercise count...
              </div>
            ) : (
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{exerciseCount}</div>
                  <div className="text-sm text-gray-600">Total Exercises</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-action-blue">{videoExercises}</div>
                  <div className="text-sm text-gray-600">With Videos</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* YouTube API Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                YouTube API Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Fetch the latest 50 videos directly from your YouTube channel. 
                This will find any new videos you've uploaded.
              </p>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Channel:</strong> UCW9ibzJH9xWAm922rVnHZtg
                </div>
                <div className="text-sm">
                  <strong>Updates:</strong> Finds new videos automatically
                </div>
              </div>

              <Button 
                onClick={() => {
                  setSyncResult(null);
                  youtubeSyncMutation.mutate();
                }}
                disabled={youtubeSyncMutation.isPending}
                className="w-full"
              >
                {youtubeSyncMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Syncing from YouTube...
                  </>
                ) : (
                  <>
                    <Youtube className="h-4 w-4 mr-2" />
                    Sync New Videos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* CSV Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-action-blue" />
                CSV Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Import from your curated CSV file with tags and movement patterns. 
                This gives you full control over categorization.
              </p>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>File:</strong> Exercise_Video_List_with_Cleaned_Tags.csv
                </div>
                <div className="text-sm">
                  <strong>Benefits:</strong> Custom tags, movement patterns
                </div>
              </div>

              <Button 
                onClick={() => {
                  setSyncResult(null);
                  csvSyncMutation.mutate();
                }}
                disabled={csvSyncMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {csvSyncMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importing from CSV...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Import from CSV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {syncResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {syncResult.imported > 0 ? (
                  <CheckCircle className="h-5 w-5 text-action-blue" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
                Sync Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  {syncResult.message}
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Badge variant="outline" className="text-action-blue">
                  {syncResult.imported} Imported
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  {syncResult.total} Total Found
                </Badge>
                {syncResult.failed && syncResult.failed > 0 && (
                  <Badge variant="outline" className="text-red-600">
                    {syncResult.failed} Failed
                  </Badge>
                )}
              </div>

              {syncResult.exercises && syncResult.exercises.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">New Exercises Added:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {syncResult.exercises.map((exercise, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        {exercise.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {syncResult.failedImports && syncResult.failedImports.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Failed Imports:</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {syncResult.failedImports.map((failed, index) => (
                      <div key={index} className="text-sm p-2 bg-red-50 rounded">
                        <div className="font-medium">{failed.video}</div>
                        <div className="text-red-600">{failed.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {(youtubeSyncMutation.error || csvSyncMutation.error) && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {youtubeSyncMutation.error?.message || csvSyncMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <strong>For new videos:</strong> Use "Sync New Videos" to automatically fetch your latest YouTube uploads
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <strong>For organized import:</strong> Update your CSV file with new videos and their tags, then use "Import from CSV"
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <strong>No duplicates:</strong> The system automatically checks for existing videos and won't create duplicates
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default VideoSyncPage;