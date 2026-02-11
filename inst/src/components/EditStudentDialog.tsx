import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Student,
  updateStudent,
  UpdateStudentData,
} from "@/services/students.services";
import { getPrograms, Program } from "@/services/programs.services";
import {
  getFaculties,
  getDepartments,
  Faculty,
  Department,
} from "@/services/faculties.services";

// Define all possible status and fee choices based on your model/request
const STUDENT_STATUS_CHOICES = [
  { value: "Active", label: "Active" },
  { value: "Attachment", label: "On Attachment" },
  { value: "Graduated", label: "Graduated" },
  { value: "Suspended", label: "Suspended" },
  { value: "Deferred", label: "Deferred" },
  { value: "Dropout", label: "Dropout" }, // Added Dropout as per model update in section 2
];

const DROPOUT_REASON_CHOICES = [
  { value: "Financial", label: "Financial Hardship" },
  { value: "Academic", label: "Academic Failure" },
  { value: "Medical", label: "Health/Medical" },
  { value: "Personal", label: "Personal/Family Issues" },
  { value: "Transfer", label: "Transfer to other Institution" },
  { value: "Other", label: "Other" },
];

const FEE_STATUS_CHOICES = [
  { value: "FullyPaid", label: "Fully Paid Fees" },
  { value: "PartiallyPaid", label: "Partially Paid" },
  { value: "SpecialFees", label: "On Special Fees Payment" },
  { value: "Disabled", label: "Disabled/Waiver" },
];

const FINAL_GRADE_CHOICES = [
  { value: "Distinction", label: "Distinction" },
  { value: "Credit", label: "Credit" },
  { value: "Pass", label: "Pass" },
  { value: "Fail", label: "Fail" },
];

interface EditStudentDialogProps {
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditStudentDialog: React.FC<EditStudentDialogProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<UpdateStudentData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Academic Data States (needed to populate dropdowns correctly)
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Initial Academic Selection State
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  // NOTE: Fee Status is currently local as it's not mapped to the Django model yet.
  const [feeStatus, setFeeStatus] = useState<string>("PartiallyPaid");

  // --- 1. Load data and Initialize form state when student prop changes ---
  useEffect(() => {
    if (student) {
      // Reset and populate form data from student prop
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        student_id: student.student_id,
        national_id: student.national_id || "",
        gender: student.gender,
        date_of_birth: student.date_of_birth || "",
        enrollment_year: student.enrollment_year,
        status: student.status,
        program: student.program, // This is the Program ID
        // Assuming institution ID is always available on the student object
        institution: student.institution,

        // Extended fields (assuming student object includes them from model update)
        // Set defaults if student object doesn't contain them initially
        graduation_year: (student as any).graduation_year || null,
        final_grade: (student as any).final_grade || null,
        dropout_reason: (student as any).dropout_reason || null,
      });

      // Fetch all academic data
      const loadAcademicData = async (instId: number) => {
        setIsFetchingData(true);
        try {
          const [facData, deptData, progData] = await Promise.all([
            getFaculties(instId),
            getDepartments({ institution: instId }),
            getPrograms({ institution_id: instId }),
          ]);

          setFaculties(facData || []);
          setDepartments(deptData || []);
          setPrograms(progData || []);

          // Try to set initial dropdown values based on the student's current program
          const currentProgram = progData?.find(
            (p) => p.id === student.program
          );
          if (currentProgram) {
            setSelectedDeptId(currentProgram.department.toString());
            // Need a way to map dept ID back to faculty ID if not directly available
            const currentDept = deptData?.find(
              (d) => d.id.toString() === currentProgram.department.toString()
            );
            if (currentDept) {
              setSelectedFacultyId(currentDept.faculty.toString());
            }
          }
        } catch (error) {
          console.error("Failed to load academic structure", error);
          toast.error("Failed to load dropdown data");
        } finally {
          setIsFetchingData(false);
        }
      };

      if (student.institution) {
        loadAcademicData(student.institution);
      }

      setError("");
    }
  }, [student]);

  // --- 2. Cascading Filter Logic ---
  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return [];
    return departments.filter(
      (d) => d.faculty.toString() === selectedFacultyId
    );
  }, [departments, selectedFacultyId]);

  const filteredPrograms = useMemo(() => {
    if (!selectedDeptId) return [];
    return programs.filter((p) => p.department.toString() === selectedDeptId);
  }, [programs, selectedDeptId]);

  // --- 3. Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    // Ensure numerical values are stored as numbers if needed
    const val = type === "number" && value ? parseInt(value, 10) : value;
    setFormData((prev) => ({ ...prev, [id]: val }));
  };

  const handleSelectChange = (
    field: keyof UpdateStudentData,
    value: string
  ) => {
    let finalValue: string | number | null = value;
    if (field === "enrollment_year" || field === "graduation_year") {
      finalValue = parseInt(value, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    // Reset specific fields when status changes to non-relevant value
    if (field === "status") {
      if (value !== "Graduated") {
        setFormData((prev) => ({
          ...prev,
          graduation_year: null,
          final_grade: null,
        }));
      }
      if (value !== "Dropout") {
        setFormData((prev) => ({ ...prev, dropout_reason: null }));
      }
    }
  };

  const handleProgramSelect = (programId: string) => {
    // Find the program object to get its details if needed, but primarily set the program ID
    handleSelectChange("program", programId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id || !student.institution) return;

    setIsLoading(true);

    try {
      const dataToSend: UpdateStudentData = {
        ...formData,

        date_of_birth: formData.date_of_birth && formData.date_of_birth.trim() !== "" 
        ? formData.date_of_birth 
        : null,
        
        program: parseInt(formData.program as any, 10),
        institution: student.institution,
        graduation_year:
          formData.status === "Graduated" ? formData.graduation_year : null,
        final_grade:
          formData.status === "Graduated" ? formData.final_grade : null,
        dropout_reason:
          formData.status === "Dropout" ? formData.dropout_reason : null,
      };

      await updateStudent(student.id, dataToSend);

      toast.success(`Student ${student.student_id} updated successfully!`);
      onSuccess(); // Close and trigger data refresh in parent
    } catch (error: any) {
      console.error("Failed to update student:", error);
      const errorMsg =
        error.response?.data?.detail || "Failed to update student";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
          <DialogDescription>
            Update the profile for **{student?.full_name}** (
            {student?.student_id})
          </DialogDescription>
        </DialogHeader>

        {(isFetchingData || isLoading) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Section 1: Personal Details --- */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">
              Personal & ID Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  required
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  required
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  required
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID</Label>
                <Input
                  id="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("gender", val)}
                  value={formData.gender}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* --- Section 2: Academic Placement --- */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-semibold border-b pb-2">
              Academic Placement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Faculty Select */}
              <div className="space-y-2">
                <Label>Faculty *</Label>
                <Select
                  onValueChange={setSelectedFacultyId}
                  value={selectedFacultyId}
                  disabled={isLoading || isFetchingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={f.id.toString()}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Department Select */}
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  onValueChange={setSelectedDeptId}
                  value={selectedDeptId}
                  disabled={
                    isLoading ||
                    !selectedFacultyId ||
                    filteredDepartments.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Program Select */}
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select
                  onValueChange={handleProgramSelect}
                  value={formData.program?.toString()}
                  disabled={
                    isLoading ||
                    !selectedDeptId ||
                    filteredPrograms.length === 0
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPrograms.map((prog) => (
                      <SelectItem key={prog.id} value={prog.id.toString()}>
                        {prog.name} ({prog.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollment_year">Enrollment Year</Label>
                <Input
                  id="enrollment_year"
                  type="number"
                  value={formData.enrollment_year}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* --- Section 3: Status & Financial --- */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold border-b pb-2">
              Enrollment & Financial Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Student Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Student Status *</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("status", val)}
                  value={formData.status}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_STATUS_CHOICES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Financial Status (Local/Custom field for design) */}
              <div className="space-y-2">
                <Label htmlFor="feeStatus">Fees Payment Status</Label>
                <Select
                  onValueChange={setFeeStatus} // Local state for design alignment
                  value={feeStatus}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee status" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_STATUS_CHOICES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conditional Fields: GRADUATED */}
            {formData.status === "Graduated" && (
              <div className="grid grid-cols-2 gap-4 p-3 border border-green-500/50 rounded-md bg-green-500/10">
                <div className="space-y-2">
                  <Label htmlFor="graduation_year">Graduation Year</Label>
                  <Input
                    id="graduation_year"
                    type="number"
                    value={formData.graduation_year || ""}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="final_grade">Final Grade</Label>
                  <Select
                    onValueChange={(val) =>
                      handleSelectChange("final_grade", val)
                    }
                    value={formData.final_grade || ""}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select final grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {FINAL_GRADE_CHOICES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Conditional Fields: DROPOUT */}
            {formData.status === "Dropout" && (
              <div className="space-y-2 p-3 border border-red-500/50 rounded-md bg-red-500/10">
                <Label htmlFor="dropout_reason">Dropout Reason</Label>
                <Select
                  onValueChange={(val) =>
                    handleSelectChange("dropout_reason", val)
                  }
                  value={formData.dropout_reason || ""}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {DROPOUT_REASON_CHOICES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
