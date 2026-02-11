import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2, 
  Loader2, Download, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
// You'll need to create this service function
import { bulkUploadStaff } from "@/services/staff.services"; 

// Required columns for validation
const REQUIRED_COLUMNS = [
  "first_name", 
  "last_name", 
  "email", 
  "phone", 
  "employee_id", 
  "position", 
  "qualification",
  "faculty_name", // We use names in excel, backend maps to IDs
  "department_name" 
];

export function UploadStaffDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 1. Basic Type Check
    if (!selectedFile.name.match(/\.(xlsx|csv)$/)) {
      setValidationError("Please upload a valid Excel (.xlsx) or CSV file.");
      return;
    }

    setFile(selectedFile);
    setValidationError(null);
    setIsAnalyzing(true);

    try {
      // 2. Client-Side Parsing & Validation
      const data = await parseExcelFile(selectedFile);
      
      // Check Headers
      const headers = Object.keys(data[0] || {});
      const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        setValidationError(`Missing required columns: ${missingColumns.join(", ")}`);
        setFile(null); // Reset file if invalid
      } else {
        setPreviewData(data.slice(0, 3)); // Show first 3 rows as preview
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      setValidationError("Could not read file. It might be corrupted.");
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleDownloadTemplate = () => {
    // Create a dummy template
    const templateData = [
      {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@inst.ac.zw",
        phone: "+26377123456",
        employee_id: "STF001",
        position: "Lecturer",
        qualification: "Masters",
        faculty_name: "Science",
        department_name: "Computer Science",
        specialization: "AI",
        date_joined: "2024-01-01"
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff_Template");
    XLSX.writeFile(wb, "Staff_Upload_Template.xlsx");
  };

  const handleUpload = async () => {
    if (!file || !user?.institution?.id) return;
    
    setIsUploading(true);
    try {
      // Create FormData to send file to backend
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institution_id", user.institution.id.toString());

      await bulkUploadStaff(formData);
      
      toast.success("Bulk upload successful! Records are being processed.");
      setOpen(false);
      setFile(null);
      setPreviewData([]);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Upload failed. Please check your data format.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Staff</DialogTitle>
          <DialogDescription>
            Upload an Excel sheet to add multiple staff members at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* 1. Template Download */}
          <div className="bg-muted/30 p-4 rounded-md border border-dashed flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Download Template</p>
                <p className="text-xs text-muted-foreground">Use this format to avoid errors</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* 2. File Drop Zone */}
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
              />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Click to select file</p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx or .csv (Max 5MB)</p>
            </div>
          ) : (
            <div className="space-y-4">
                {/* File Selected State */}
                <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); setValidationError(null); }}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Validation Error */}
                {validationError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Validation Error</AlertTitle>
                        <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                )}

                {/* Success Preview */}
                {!validationError && !isAnalyzing && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-700 dark:text-green-400">File Ready</AlertTitle>
                        <AlertDescription className="text-green-600 dark:text-green-300 text-xs mt-1">
                            Successfully parsed {previewData.length > 0 ? "data" : "file"}. 
                            Detected columns match requirements.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || !!validationError || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}