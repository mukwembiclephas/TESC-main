import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- Import your services and types ---
import { createStudent } from "../../services/student.service";
import { getAllInstitutions } from "../../services/institution.service";
import { getProgramsByInstitution } from "@/services/academic.service";
import {
  StudentWriteData,
  Institution,
  Program,
} from "@/lib/types/academic.types";

// --- (Make sure this is outside the component) ---
interface AddStudentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// --- Constants from your backend model ---
const genders: StudentWriteData["gender"][] = ["Male", "Female", "Other"];
const statuses: StudentWriteData["status"][] = [
  "Active",
  "Attachment",
  "Graduated",
  "Suspended",
  "Deferred",
];

const initialFormData: StudentWriteData = {
  student_id: "",
  national_id: "",
  first_name: "",
  last_name: "",
  gender: "Male",
  enrollment_year: new Date().getFullYear(),
  status: "Active",
  institution: 0, // Will hold the institution ID
  program: 0, // Will hold the program ID
  date_of_birth: "",
};

export default function AddStudent({ open, onOpenChange }: AddStudentProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<StudentWriteData>(initialFormData);
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({});

  // --- Data Fetching (React Query) ---

  // 1. Fetch all institutions when the modal opens
  const { data: institutions, isLoading: isLoadingInstitutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
    enabled: open, // Only fetch when the modal is open
  });

  // 2. Fetch programs *only when* an institution is selected
  const selectedInstitutionId =
    formData.institution ? Number(formData.institution) : 0;

  const { data: programs, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ["programs", selectedInstitutionId],
    queryFn: () => getProgramsByInstitution(selectedInstitutionId),
    enabled: !!selectedInstitutionId && open, // Only fetch if ID is valid and modal is open
  });

  // --- Form Submission (React Query) ---
  const { mutate, isPending } = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      toast.success("Student created successfully!");
      queryClient.invalidateQueries({ queryKey: ["students"] }); // Refetch student list
      onOpenChange(false); // Close modal
    },
    onError: (error: any) => {
      // Handle validation errors from Django
      if (error.response?.status === 400) {
        setApiErrors(error.response.data);
        toast.error("Please correct the errors in the form.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
  });

  // --- Form Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // If institution changes, reset the selected program
    if (field === "institution") {
      setFormData((prev) => ({ ...prev, program: 0 }));
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setApiErrors({});
    }
  }, [open]);

  // Handle the form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({}); // Clear old errors

    // Convert string IDs from <Select> back to numbers for the API
    const dataToSend: StudentWriteData = {
      ...formData,
      institution: Number(formData.institution),
      program: Number(formData.program),
      enrollment_year: Number(formData.enrollment_year),
    };

    mutate(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Student
          </DialogTitle>
          <DialogDescription>
            Enter the student's details to enroll them in an institution.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto pr-6 space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* --- Fields Updated to Match Model --- */}

              {/* Student ID */}
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  placeholder="e.g., ST005"
                  value={formData.student_id}
                  onChange={handleInputChange}
                />
                {apiErrors.student_id && (
                  <p className="text-xs text-red-500">
                    {apiErrors.student_id[0]}
                  </p>
                )}
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID (Optional)</Label>
                <Input
                  id="national_id"
                  placeholder="e.g., 63-1234567A00"
                  value={formData.national_id || ""}
                  onChange={handleInputChange}
                />
                {apiErrors.national_id && (
                  <p className="text-xs text-red-500">
                    {apiErrors.national_id[0]}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="e.g., Tendai"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
                {apiErrors.first_name && (
                  <p className="text-xs text-red-500">
                    {apiErrors.first_name[0]}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="e.g., Mukamuri"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
                {apiErrors.last_name && (
                  <p className="text-xs text-red-500">
                    {apiErrors.last_name[0]}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth (Optional)</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ""}
                  onChange={handleInputChange}
                />
              </div>

              {/* Institution (Dynamic) */}
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Select
                  value={formData.institution?.toString() || "0"}
                  onValueChange={(value) =>
                    handleSelectChange("institution", value)
                  }
                  disabled={isLoadingInstitutions}
                >
                  <SelectTrigger id="institution">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions?.map((inst: Institution) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {apiErrors.institution && (
                  <p className="text-xs text-red-500">
                    {apiErrors.institution[0]}
                  </p>
                )}
              </div>

              {/* Program (Dynamic & Dependent) */}
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select
                  value={formData.program?.toString() || "0"}
                  onValueChange={(value) =>
                    handleSelectChange("program", value)
                  }
                  disabled={!formData.institution || isLoadingPrograms}
                >
                  <SelectTrigger id="program">
                    <SelectValue
                      placeholder={
                        isLoadingPrograms
                          ? "Loading programs..."
                          : !formData.institution
                          ? "Select an institution first"
                          : "Select program"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {programs?.map((prog: Program) => (
                      <SelectItem key={prog.id} value={prog.id.toString()}>
                        {prog.name} - ({prog.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {apiErrors.program && (
                  <p className="text-xs text-red-500">
                    {apiErrors.program[0]}
                  </p>
                )}
              </div>

              {/* Enrollment Year */}
              <div className="space-y-2">
                <Label htmlFor="enrollment_year">Enrollment Year</Label>
                <Input
                  id="enrollment_year"
                  type="number"
                  placeholder="e.g., 2024"
                  value={formData.enrollment_year}
                  onChange={handleInputChange}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Student Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((stat) => (
                      <SelectItem key={stat} value={stat}>
                        {stat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? "Saving..." : "Save Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}