import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BatchResult {
  success: boolean;
  message: string;
  updated: number;
  failed: number;
  remaining: number;
  completed: boolean;
  batchSize: number;
}

export default function VideoLibraryManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [useTemplates, setUseTemplates] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const processBatch = async () => {
    if (isPaused) return;
    
    try {
      const response = await fetch('/api/exercises/batch-fix-descriptions?demo=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchSize,
          useTemplates
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to process batch: ${response.statusText}`);
      }

      const result: BatchResult = await response.json();
      
      setResults(prev => [...prev, result]);
      setTotalProcessed(prev => prev + result.updated);
      setTotalRemaining(result.remaining);
      
      if (result.completed) {
        setIsCompleted(true);
        setIsProcessing(false);
      } else if (!isPaused) {
        // Continue to next batch after a delay
        setTimeout(() => {
          if (!isPaused) {
            processBatch();
          }
        }, 2000);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsProcessing(false);
    }
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setTotalProcessed(0);
    setIsCompleted(false);
    setIsPaused(false);
    
    await processBatch();
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    setIsProcessing(true);
    processBatch();
  };

  const resetProcessing = () => {
    setIsProcessing(false);
    setIsPaused(false);
    setResults([]);
    setTotalProcessed(0);
    setTotalRemaining(0);
    setIsCompleted(false);
    setError(null);
  };

  const calculateProgress = () => {
    if (totalRemaining === 0 && results.length === 0) return 0;
    const initialTotal = totalRemaining + totalProcessed;
    if (initialTotal === 0) return 0;
    return Math.round((totalProcessed / initialTotal) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            📹 YouTube Library Description Manager
          </CardTitle>
          <p className="text-gray-600">
            Automatically generate complete exercise descriptions for your entire YouTube video library. 
            Processes videos in smart batches to avoid API limits while ensuring every exercise has detailed instructions.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="batch-size">Batch Size</Label>
              <select 
                id="batch-size"
                value={batchSize} 
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full p-2 border rounded"
                disabled={isProcessing}
                data-testid="batch-size-select"
              >
                <option value={5}>5 videos (Slower, safer)</option>
                <option value={10}>10 videos (Recommended)</option>
                <option value={20}>20 videos (Faster, may hit limits)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-templates" 
                  checked={useTemplates}
                  onCheckedChange={setUseTemplates}
                  disabled={isProcessing}
                  data-testid="use-templates-toggle"
                />
                <Label htmlFor="use-templates">Use Templates Only</Label>
              </div>
              <p className="text-xs text-gray-500">
                {useTemplates ? 'Fast template-based descriptions' : 'AI-generated with template fallback'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                {isCompleted && <Badge variant="default" className="bg-green-600">Completed</Badge>}
                {isProcessing && <Badge variant="default" className="bg-blue-600">Processing</Badge>}
                {isPaused && <Badge variant="outline">Paused</Badge>}
                {!isProcessing && !isCompleted && !isPaused && <Badge variant="outline">Ready</Badge>}
              </div>
            </div>
          </div>

          {/* Progress */}
          {(isProcessing || results.length > 0) && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Progress</h3>
                <span className="text-sm text-gray-600">
                  {totalProcessed} processed, {totalRemaining} remaining
                </span>
              </div>
              <Progress value={calculateProgress()} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                {calculateProgress()}% complete
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            {!isProcessing && !isPaused && (
              <Button 
                onClick={startProcessing}
                disabled={isProcessing}
                size="lg"
                className="flex-1"
                data-testid="start-processing-btn"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Processing Library
              </Button>
            )}
            
            {isProcessing && (
              <Button 
                onClick={pauseProcessing}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause Processing
              </Button>
            )}
            
            {isPaused && (
              <Button 
                onClick={resumeProcessing}
                size="lg"
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume Processing
              </Button>
            )}
            
            {(results.length > 0 || error) && (
              <Button 
                onClick={resetProcessing}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Current Status */}
          {isProcessing && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Processing videos in batches...</p>
                  <p className="text-sm">
                    Using {useTemplates ? 'template-based' : 'AI-powered'} description generation. 
                    Each batch processes {batchSize} videos with a 2-second delay between batches.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium text-green-700">🎉 All videos processed!</p>
                  <p className="text-sm text-green-600">
                    Your entire YouTube library now has complete exercise descriptions. 
                    All workout plans will show detailed instructions instead of truncated text.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium text-red-700">Error: {error}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Results Summary */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Batch Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Batch {index + 1}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">✓ {result.updated}</span>
                          {result.failed > 0 && <span className="text-red-600">✗ {result.failed}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{totalProcessed}</div>
                      <div className="text-sm text-gray-600">Total Updated</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{results.reduce((sum, r) => sum + r.failed, 0)}</div>
                      <div className="text-sm text-gray-600">Total Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{totalRemaining}</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <div className="text-sm text-gray-500 space-y-2 bg-gray-50 p-4 rounded-lg">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Smart Batching:</strong> Processes videos in small batches to avoid API rate limits</li>
              <li><strong>Dual Mode:</strong> Uses AI for detailed descriptions, with template fallback for reliability</li>
              <li><strong>Auto-Recovery:</strong> Continues processing even if some videos fail</li>
              <li><strong>Pause/Resume:</strong> Can pause and resume processing at any time</li>
              <li><strong>Progress Tracking:</strong> Shows real-time progress and detailed results</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}