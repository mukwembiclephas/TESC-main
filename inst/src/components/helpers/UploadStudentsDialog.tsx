import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, FileSpreadsheet, AlertCircle, CheckCircle2, 
  Loader2, Download, X, HelpCircle, Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { bulkUploadStudents } from "@/services/students.services";

// Columns we expect in the Excel file
const REQUIRED_COLUMNS = [
  "first_name", 
  "last_name", 
  "student_id", 
  "program", 
  "enrollment_year"
];

export function UploadStudentsDialog({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|csv)$/)) {
      setValidationError("Please upload a valid Excel (.xlsx) or CSV file.");
      return;
    }

    setFile(selectedFile);
    setValidationError(null);
    setServerErrors([]);

    // Client-side header check
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        const headers = (data[0] as string[]).map(h => h.toLowerCase().trim().replace(/ /g, '_'));
        const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        if (missing.length > 0) {
          setValidationError(`Missing required columns: ${missing.join(", ")}`);
          setFile(null);
        }
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !user?.institution?.id) return;
    
    setIsUploading(true);
    setServerErrors([]);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institution_id", user.institution.id.toString());

      const res = await bulkUploadStudents(formData);
      
      toast.success(res.message || "Students uploaded successfully!");
      setOpen(false);
      setFile(null);
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error(error);
      
      // Handle the JSON response from our fixed backend
      if (error.response?.data?.errors) {
        // Backend returns: { detail: "...", errors: ["Row 1...", "Row 2..."] }
        setServerErrors(error.response.data.errors);
        toast.error("Upload failed. Please check the error list.");
      } else if (error.response?.data?.detail) {
        // Fallback for generic errors
        // Check if detail is stringified JSON (handling legacy backend behavior if not updated yet)
        try {
            // Attempt to parse if it looks like the stringified dict you saw
            const parsed = JSON.parse(error.response.data.detail.replace(/'/g, '"')); 
            if (parsed.errors) setServerErrors(parsed.errors);
            else setValidationError(error.response.data.detail);
        } catch {
            setValidationError(error.response.data.detail);
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        student_id: "ST2025001",
        first_name: "Tinashe",
        last_name: "Moyo",
        national_id: "63-1234567A00",
        gender: "Male",
        // Added Context Columns
        faculty: "Faculty of Science",
        department: "Computer Science",
        program: "BSCS", 
        enrollment_year: 2025,
      },
      {
        student_id: "ST2025002",
        first_name: "Rudo",
        last_name: "Ncube",
        national_id: "63-9876543B11",
        gender: "Female",
        faculty: "Faculty of Commerce",
        department: "Accounting",
        program: "Bachelor of Accounting", 
        enrollment_year: 2025,
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students_Template");
    XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Students</DialogTitle>
          <DialogDescription>Enroll multiple students via Excel sheet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          {/* Instructions Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline hover:text-foreground">
                    <span className="flex items-center gap-2">
                        <Info className="h-4 w-4" /> View Formatting Guidelines
                    </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm space-y-3 bg-muted/30 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="font-semibold block mb-1">Required Columns</span>
                            <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                <li>student_id (Unique)</li>
                                <li>first_name</li>
                                <li>last_name</li>
                                <li>program (Code e.g., 'BSCS')</li>
                                <li>enrollment_year</li>
                            </ul>
                        </div>
                        <div>
                            <span className="font-semibold block mb-1">Optional</span>
                            <ul className="list-disc pl-4 text-xs text-muted-foreground">
                                <li>national_id</li>
                                <li>gender (Male/Female)</li>
                                <li>date_of_birth (YYYY-MM-DD)</li>
                                <li>status (Active/Suspended)</li>
                            </ul>
                        </div>
                    </div>
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                        <strong>Important:</strong> The <code>program</code> column must match an existing Program Code or Name in the system exactly. If the program doesn't exist, create it first.
                    </div>
                </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Template Download Button */}
          <div className="flex items-center justify-between border border-dashed p-4 rounded-md">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-sm font-medium">Download Template</p>
                    <p className="text-xs text-muted-foreground">Pre-formatted Excel file</p>
                </div>
             </div>
             <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" /> Download
             </Button>
          </div>

          {/* File Input */}
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/20 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv, .xlsx"
                onChange={handleFileChange}
              />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Click to select file</p>
              <p className="text-xs text-muted-foreground mt-1">Supports .xlsx and .csv (Max 5MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">Ready to upload</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setValidationError(null); setServerErrors([]); }}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}

          {/* Errors Display */}
          {validationError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Format Error</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          {serverErrors.length > 0 && (
             <Alert variant="destructive" className="max-h-[150px] overflow-y-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">Please fix the following errors in your file and try again:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        {serverErrors.map((err, i) => (
                            <li key={i} className="text-xs">{err}</li>
                        ))}
                    </ul>
                </AlertDescription>
             </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || !!validationError || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload Students
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}