import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Upload, Video, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  message: string;
  imported: number;
  failed: number;
  errors?: string[];
  csvFile?: string;
}

export function VideoImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [csvFile, setCsvFile] = useState("youtube_video_list_replit_ready.csv");
  const { toast } = useToast();

  const handleCSVImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch("/api/exercises/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvFile })
      });

      const result = await response.json();
      setImportResult(result);

      if (response.ok) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${result.imported} exercises`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: result.message || "Failed to import exercises",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Error",
        description: "An error occurred during import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleYouTubeImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await fetch("/api/exercises/import-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelId: "UCW9ibzJH9xWAm922rVnHZtg" })
      });

      const result = await response.json();
      setImportResult(result);

      if (response.ok) {
        toast({
          title: "YouTube Import Complete",
          description: `Successfully imported ${result.imported} exercises`,
        });
      } else {
        toast({
          title: "YouTube Import Failed",
          description: result.message || "Failed to import YouTube exercises",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("YouTube import error:", error);
      toast({
        title: "YouTube Import Error",
        description: "An error occurred during YouTube import",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CSV Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CSV Video Import
            </CardTitle>
            <CardDescription>
              Import exercise videos from CSV file with titles, video IDs, and optional tags
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File Name</Label>
              <Input
                id="csvFile"
                value={csvFile}
                onChange={(e) => setCsvFile(e.target.value)}
                placeholder="youtube_video_list_with_tags.csv"
              />
            </div>
            
            <Button 
              onClick={handleCSVImport}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import from CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* YouTube Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-red-600" />
              YouTube API Import
            </CardTitle>
            <CardDescription>
              Import exercises directly from YouTube channel using API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Uses YouTube API to fetch videos from channel with metadata
            </div>
            
            <Button 
              onClick={handleYouTubeImport}
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Import from YouTube
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle className="h-3 w-3 mr-1" />
                {importResult.imported} Imported
              </Badge>
              {importResult.failed > 0 && (
                <Badge variant="outline" className="bg-red-50">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {importResult.failed} Failed
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {importResult.message}
            </div>

            {importResult.csvFile && (
              <div className="text-xs text-muted-foreground">
                Source: {importResult.csvFile}
              </div>
            )}

            {importResult.errors && importResult.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Import Errors:</div>
                    <div className="text-sm">
                      {importResult.errors.slice(0, 3).map((error, index) => (
                        <div key={index} className="text-muted-foreground">
                          • {error}
                        </div>
                      ))}
                      {importResult.errors.length > 3 && (
                        <div className="text-muted-foreground">
                          ... and {importResult.errors.length - 3} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}