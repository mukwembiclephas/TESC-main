import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
}
 from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { 
    Staff as StaffType, 
    updateStaff 
} from "@/services/staff.services";
import { 
    getFaculties, 
    getDepartments, 
    Faculty, 
    Department 
} from "@/services/faculties.services";
import { Alert, AlertDescription } from "./ui/alert";

interface EditStaffDialogProps {
  staff: StaffType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditStaffDialog: React.FC<EditStaffDialogProps> = ({
  staff,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<StaffType>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  
  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Selected State (used for cascading logic)
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | undefined>(undefined);
  const [error, setError] = useState("");


  // --- 1. Load data and Initialize form state when staff prop changes ---
  useEffect(() => {
    if (staff) {
        setError("");
        // Set initial form data from the staff prop
        setFormData({
            first_name: staff.first_name,
            last_name: staff.last_name,
            email: staff.email,
            phone: staff.phone,
            employee_id: staff.employee_id,
            position: staff.position,
            qualification: staff.qualification,
            specialization: staff.specialization || '',
            date_joined: staff.date_joined, // Assuming date is in 'YYYY-MM-DD' format
            is_active: staff.is_active,
            department: staff.department, // Current Department ID
            faculty: staff.faculty,       // Current Faculty ID
        });

        // Set initial selected values for cascading dropdowns
        setSelectedFacultyId(staff.faculty);
        
        // Fetch academic data
        const loadAcademicData = async (instId: number) => {
            setIsFetchingData(true);
            try {
                const [facData, deptData] = await Promise.all([
                    getFaculties(instId),
                    getDepartments({ institution: instId })
                ]);

                setFaculties(Array.isArray(facData) ? facData : []);
                setDepartments(Array.isArray(deptData) ? deptData : []);
            } catch (error) {
                console.error("Failed to load academic data", error);
                toast.error("Could not load faculty/department lists.");
            } finally {
                setIsFetchingData(false);
            }
        };

        if (staff.institution) {
            loadAcademicData(staff.institution);
        }
    }
  }, [staff]);

  // --- 2. Filter Departments (Cascading Logic) ---
  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) return [];
    return departments.filter(d => d.faculty === selectedFacultyId);
  }, [departments, selectedFacultyId]);


  // --- 3. Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    // Special handling for boolean status
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleFacultyChange = (value: string) => {
    const newFacultyId = parseInt(value, 10);
    setSelectedFacultyId(newFacultyId);
    
    // Clear department if faculty changes
    setFormData(prev => ({ ...prev, faculty: newFacultyId, department: undefined }));
  };
  
  const handleDepartmentChange = (value: string) => {
      setFormData(prev => ({ ...prev, department: parseInt(value, 10) }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff?.id) return;

    setIsLoading(true);
    setError("");

    try {
      // Basic Validation Check (reusing the required fields from AddStaff)
      if (!formData.first_name || !formData.last_name || !formData.employee_id || !formData.email || !formData.position || !formData.faculty || !formData.department) {
        setError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }
      
      // Send only the required fields + the updated ones
      const dataToSend: Partial<StaffType> = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          employee_id: formData.employee_id,
          position: formData.position,
          qualification: formData.qualification,
          specialization: formData.specialization,
          date_joined: formData.date_joined,
          is_active: formData.is_active,
          department: formData.department,
          faculty: formData.faculty,
      };

      await updateStaff(staff.id, dataToSend);

      toast.success("Staff member updated successfully!");
      onSuccess(); // Close dialog and refresh parent list
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || "Failed to update staff member.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!staff} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update details for **{staff?.full_name}** ({staff?.employee_id})
          </DialogDescription>
        </DialogHeader>

        {isFetchingData && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        
        {error && (
            <div className="my-2">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" value={formData.first_name} required onChange={handleInputChange} disabled={isLoading || isFetchingData} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" value={formData.last_name} required onChange={handleInputChange} disabled={isLoading || isFetchingData} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" value={formData.email} placeholder="sarah.n@institution.ac.zw" required onChange={handleInputChange} disabled={isLoading || isFetchingData} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" value={formData.phone} placeholder="+263 77 123 4567" required onChange={handleInputChange} disabled={isLoading || isFetchingData} />
            </div>
          </div>

          {/* Employment Info */}
          <div className="p-4 bg-muted/30 rounded-md border space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Placement</h4>
            <div className="grid grid-cols-2 gap-4">
                {/* 1. Faculty Select */}
                <div className="space-y-2">
                <Label htmlFor="faculty">Faculty *</Label>
                <Select 
                    onValueChange={handleFacultyChange} 
                    value={selectedFacultyId?.toString()} 
                    disabled={isLoading || isFetchingData}
                >
                    <SelectTrigger id="faculty">
                    <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                    {faculties.map((fac) => (
                        <SelectItem key={fac.id} value={fac.id.toString()}>
                        {fac.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                {/* 2. Department Select (Cascading) */}
                <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                    onValueChange={handleDepartmentChange}
                    disabled={isLoading || isFetchingData || !selectedFacultyId || filteredDepartments.length === 0}
                    value={formData.department ? formData.department.toString() : ""}
                >
                    <SelectTrigger id="department">
                    <SelectValue placeholder={!selectedFacultyId ? "Select faculty first" : "Select department"} />
                    </SelectTrigger>
                    <SelectContent>
                    {filteredDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {selectedFacultyId && filteredDepartments.length === 0 && (
                    <span className="text-[10px] text-destructive flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" /> No departments found in this faculty.
                    </span>
                )}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select 
                onValueChange={(val) => setFormData(prev => ({ ...prev, position: val }))} 
                value={formData.position} 
                required 
                disabled={isLoading || isFetchingData}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                  <SelectItem value="Assistant">Assistant Lecturer</SelectItem>
                  <SelectItem value="Admin">Administrative Staff</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Highest Qualification *</Label>
              <Select 
                onValueChange={(val) => setFormData(prev => ({ ...prev, qualification: val }))} 
                value={formData.qualification} 
                required 
                disabled={isLoading || isFetchingData}
              >
                <SelectTrigger id="qualification">
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Masters">Masters</SelectItem>
                  <SelectItem value="Bachelors">Bachelors</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID *</Label>
              <Input id="employee_id" value={formData.employee_id} placeholder="STF001" required onChange={handleInputChange} disabled={isLoading || isFetchingData} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_joined">Join Date *</Label>
              <Input 
                id="date_joined" 
                type="date" 
                required 
                value={formData.date_joined}
                onChange={handleInputChange} 
                disabled={isLoading || isFetchingData}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Area of Specialization</Label>
            <Textarea 
              id="specialization" 
              value={formData.specialization}
              placeholder="e.g., Artificial Intelligence, Software Engineering" 
              rows={2} 
              onChange={handleInputChange}
              disabled={isLoading || isFetchingData}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
                disabled={isLoading || isFetchingData}
            />
            <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Staff member is Active
            </Label>
          </div>


          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
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