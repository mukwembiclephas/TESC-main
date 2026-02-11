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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Import Auth Context
import { createStaff, CreateStaffData } from "@/services/staff.services";
// Import Department services
import { getFaculties, getDepartments, Faculty, Department } from "@/services/faculties.services"; 

export function AddStaffDialog({ onStaffAdded }: { onStaffAdded?: () => void }) {
  const { user } = useAuth(); // Get user context for Institution ID
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateStaffData>>({
    institution: user?.institution?.id, 
    date_joined: new Date().toISOString().split('T')[0], 
    position: '',
    qualification: '',
    department: undefined, // Stores the department ID (number)
    faculty: undefined,    // Stores the faculty ID (number)
    is_active: true
  });

  // --- 1. Fetch Data on Open ---
  useEffect(() => {
    if (open && user?.institution?.id) {
      const loadData = async () => {
        try {
          // Fetch both faculties and departments for the institution
          const [facData, deptData] = await Promise.all([
            getFaculties(user.institution.id),
            getDepartments({ institution: user.institution.id })
          ]);

          setFaculties(Array.isArray(facData) ? facData : []);
          setDepartments(Array.isArray(deptData) ? deptData : []);
        } catch (error) {
          console.error("Failed to load academic data", error);
          toast.error("Could not load faculty/department lists.");
        }
      };
      loadData();
    }
  }, [open, user]);

  // --- 2. Filter Departments (Cascading Logic) ---
  const filteredDepartments = useMemo(() => {
    if (!formData.faculty) return [];
    return departments.filter(d => d.faculty === formData.faculty);
  }, [departments, formData.faculty]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof CreateStaffData, value: string) => {
    // Convert IDs to numbers
    const val = (field === 'faculty' || field === 'institution' || field === 'department') 
      ? parseInt(value) 
      : value;

    setFormData(prev => {
        const newData = { ...prev, [field]: val };
        // If faculty changes, clear the selected department
        if (field === 'faculty') {
            newData.department = undefined; 
        }
        return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!formData.first_name || !formData.last_name || !formData.employee_id || !formData.email || !formData.position || !formData.faculty || !formData.department) {
        toast.error("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      await createStaff(formData as CreateStaffData);
      
      toast.success("Staff member added successfully!");
      setOpen(false);
      
      // Reset form
      setFormData({
        institution: user?.institution?.id,
        date_joined: new Date().toISOString().split('T')[0],
        position: '',
        qualification: '',
        faculty: undefined,
        department: undefined,
        is_active: true
      });
      
      if (onStaffAdded) onStaffAdded();
      
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to add staff member.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Register a new staff member in the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" placeholder="Sarah" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" placeholder="Ndlovu" required onChange={handleInputChange} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="sarah.n@institution.ac.zw" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" placeholder="+263 77 123 4567" required onChange={handleInputChange} />
            </div>
          </div>

          {/* Employment Info */}
          <div className="p-4 bg-muted/30 rounded-md border space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Placement</h4>
            <div className="grid grid-cols-2 gap-4">
                {/* 1. Faculty Select */}
                <div className="space-y-2">
                <Label htmlFor="faculty">Faculty *</Label>
                <Select onValueChange={(val) => handleSelectChange('faculty', val)}>
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
                    onValueChange={(val) => handleSelectChange('department', val)}
                    disabled={!formData.faculty || filteredDepartments.length === 0}
                    value={formData.department ? formData.department.toString() : ""}
                >
                    <SelectTrigger id="department">
                    <SelectValue placeholder={!formData.faculty ? "Select faculty first" : "Select department"} />
                    </SelectTrigger>
                    <SelectContent>
                    {filteredDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {formData.faculty && filteredDepartments.length === 0 && (
                    <span className="text-[10px] text-destructive flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" /> No departments found
                    </span>
                )}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Select onValueChange={(val) => handleSelectChange('position', val)} required>
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
              <Select onValueChange={(val) => handleSelectChange('qualification', val)} required>
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
              <Input id="employee_id" placeholder="STF001" required onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_joined">Join Date *</Label>
              <Input 
                id="date_joined" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split('T')[0]}
                onChange={handleInputChange} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Area of Specialization</Label>
            <Textarea 
              id="specialization" 
              placeholder="e.g., Artificial Intelligence, Software Engineering" 
              rows={2} 
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Staff Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}