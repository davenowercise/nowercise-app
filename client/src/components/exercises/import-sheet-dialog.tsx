import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportSheetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportSheetDialog({ isOpen, onClose }: ImportSheetDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  
  const handleImport = async () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a Google Sheet URL",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsImporting(true);
      
      // Call the API endpoint
      await apiRequest(
        "POST",
        "/api/exercises/import-from-sheets",
        { sheetUrl }
      );
      
      // Refresh exercises
      queryClient.invalidateQueries({ queryKey: ["/api/exercises"] });
      
      toast({
        title: "Success",
        description: "Exercise import initiated. Exercises will be added to your library.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error importing from sheet:", error);
      toast({
        title: "Import Failed",
        description: "There was a problem importing exercises from the Google Sheet",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Exercises from Google Sheet
          </DialogTitle>
          <DialogDescription>
            Import exercise videos from the provided Google Sheet with Vimeo links.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This will import exercises from the Google Sheet and add them to your exercise library.
              Each row in the sheet should contain exercise data with Vimeo links.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <label htmlFor="sheet-url" className="text-sm font-medium">
              Google Sheet URL
            </label>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Paste the full URL to the Google Sheet containing exercise data and Vimeo links
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Exercises"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}