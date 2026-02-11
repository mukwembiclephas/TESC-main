import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom"; // For navigation links
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Import Auth
import { createStudent, CreateStudentData } from "@/services/students.services";
// Import necessary services and types
import { getPrograms, Program } from "@/services/programs.services";
import { 
  getFaculties, 
  getDepartments, 
  Faculty, 
  Department 
} from "@/services/faculties.services";

export function AddStudentDialog({ onStudentAdded }: { onStudentAdded?: () => void }) {
  const { user } = useAuth(); // Get Institution ID from context
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Selection State (for cascading dropdowns)
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState<Partial<CreateStudentData>>({
    institution: user?.institution?.id,
    enrollment_year: new Date().getFullYear(),
    status: 'Active'
  });

  // --- 1. Fetch Data on Open ---
  useEffect(() => {
    const loadData = async () => {
      if (!open || !user?.institution?.id) return;
      
      setIsFetchingData(true);
      try {
        // Fetch all simultaneously for speed
        const [facData, deptData, progData] = await Promise.all([
        // 1. Get Faculties for this Inst
        getFaculties(user.institution.id),
        
        // 2. Get Departments for this Inst (Fix syntax here)
        getDepartments({ institution: user.institution.id }), 
        
        // 3. Get Programs for this Inst
        getPrograms({ institution_id: user.institution.id })
      ]);

        setFaculties(facData || []);
        setDepartments(deptData || []);
        setPrograms(progData || []);
      } catch (error) {
        console.error("Failed to load academic structure", error);
        toast.error("Failed to load dropdown data");
      } finally {
        setIsFetchingData(false);
      }
    };

    if (open) loadData();
  }, [open, user]);

  // --- 2. Filter Logic (Cascading) ---
  
  // Filter Departments based on selected Faculty
  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return [];
    return departments.filter(d => d.faculty.toString() === selectedFacultyId);
  }, [departments, selectedFacultyId]);

  // Filter Programs based on selected Department
  const filteredPrograms = useMemo(() => {
    if (!selectedDeptId) return [];
    return programs.filter(p => p.department.toString() === selectedDeptId);
  }, [programs, selectedDeptId]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof CreateStudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.institution?.id) return;

    setIsLoading(true);

    try {
        if (!formData.student_id || !formData.first_name || !formData.last_name || !formData.program) {
            toast.error("Please fill in all required fields");
            return;
        }

        await createStudent({
            ...formData as CreateStudentData,
            institution: user.institution.id // Ensure ID is present
        });
        
        toast.success("Student added successfully!");
        setOpen(false);
        // Reset form
        setFormData({ 
            institution: user.institution.id, 
            enrollment_year: new Date().getFullYear(), 
            status: 'Active' 
        });
        setSelectedFacultyId("");
        setSelectedDeptId("");
        
        if (onStudentAdded) onStudentAdded();
    } catch (error: any) {
        const errorMsg = error.response?.data?.detail || "Failed to create student";
        toast.error(errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  // --- 3. Empty State Checks ---
  const noFaculties = !isFetchingData && faculties.length === 0;
  const noPrograms = !isFetchingData && programs.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Register a new student in the system</DialogDescription>
        </DialogHeader>

        {/* --- CRITICAL: Blocking Empty States --- */}
        {noFaculties ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Setup Required</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-2">
              <p>You cannot add students because no <strong>Faculties</strong> have been created yet.</p>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link to="/dashboard/faculties" onClick={() => setOpen(false)}>
                  Go to Faculties Page <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : noPrograms ? (
           <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Programs Missing</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-2">
              <p>You cannot add students because no <strong>Academic Programs</strong> exist.</p>
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link to="/dashboard/programs" onClick={() => setOpen(false)}>
                  Go to Programs Page <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Personal Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input id="first_name" placeholder="John" required onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input id="last_name" placeholder="Doe" required onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input id="student_id" placeholder="ST001" required onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">National ID</Label>
                <Input id="national_id" placeholder="63-1234567A00" onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(val) => handleSelectChange('gender', val)} required>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" type="date" onChange={handleInputChange} />
              </div>
            </div>

            {/* --- CASCADING DROPDOWNS START --- */}
            <div className="p-4 bg-muted/50 rounded-md border space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Academic Placement</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    {/* 1. Faculty Select (Filter Depts) */}
                    <div className="space-y-2">
                        <Label>Faculty *</Label>
                        <Select onValueChange={setSelectedFacultyId} value={selectedFacultyId}>
                        <SelectTrigger disabled={isFetchingData}>
                            <SelectValue placeholder="Select Faculty" />
                        </SelectTrigger>
                        <SelectContent>
                            {faculties.map((f) => (
                            <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>

                    {/* 2. Department Select (Filter Programs) */}
                    <div className="space-y-2">
                        <Label>Department *</Label>
                        <Select 
                            onValueChange={setSelectedDeptId} 
                            value={selectedDeptId} 
                            disabled={!selectedFacultyId || filteredDepartments.length === 0}
                        >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredDepartments.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        {selectedFacultyId && filteredDepartments.length === 0 && (
                             <p className="text-[10px] text-destructive">No departments in this faculty.</p>
                        )}
                    </div>
                </div>

                {/* 3. Program Select (Actual Value) */}
                <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select 
                        onValueChange={(val) => handleSelectChange('program', val)} 
                        disabled={!selectedDeptId || filteredPrograms.length === 0}
                        required
                    >
                    <SelectTrigger className={!formData.program ? "border-amber-400" : ""}>
                        <SelectValue placeholder="Select Program of Study" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredPrograms.map((prog) => (
                        <SelectItem key={prog.id} value={prog.id.toString()}>
                            {prog.name} ({prog.code})
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                     {selectedDeptId && filteredPrograms.length === 0 && (
                             <p className="text-[10px] text-destructive">No programs in this department.</p>
                        )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="enrollment_year">Enrollment Year</Label>
                    <Input 
                    id="enrollment_year" 
                    type="number" 
                    defaultValue={new Date().getFullYear()}
                    onChange={handleInputChange} 
                    />
                </div>
            </div>
            {/* --- CASCADING DROPDOWNS END --- */}

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(val) => handleSelectChange('status', val)} defaultValue="Active">
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Attachment">On Attachment</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Student
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}