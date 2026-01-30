import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AdminDescriptionsFix() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fixDescriptions = async () => {
    setIsFixing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/exercises/fix-descriptions?demo=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fix descriptions: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Exercise Descriptions Fix</CardTitle>
          <p className="text-gray-600">
            This tool will automatically generate complete exercise descriptions for all exercises 
            that currently have truncated text ending with "...". This ensures all workout plans 
            show complete, detailed instructions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fixDescriptions}
            disabled={isFixing}
            size="lg"
            className="w-full"
          >
            {isFixing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Descriptions... (This may take a few minutes)
              </>
            ) : (
              'Fix All Truncated Exercise Descriptions'
            )}
          </Button>

          {result && (
            <Alert className={result.success ? 'border-info-border bg-info-panel' : 'border-red-200 bg-red-50'}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.success && (
                    <div className="text-sm text-accent-blue">
                      <p>• Updated: {result.updated} exercises</p>
                      <p>• Failed: {result.failed} exercises</p>
                      <p>• Total processed: {result.total} exercises</p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium text-red-700">Error: {error}</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Finds all exercises with descriptions ending in "..."</li>
              <li>Uses AI to generate complete, cancer-specific exercise instructions</li>
              <li>Updates the database with detailed step-by-step descriptions</li>
              <li>Ensures all workout plans show complete, helpful text</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}