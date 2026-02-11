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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// New imports for Combobox
import { 
  Plus, Loader2, AlertCircle, Check, ChevronsUpDown 
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Services
import { createProgram } from "@/services/programs.services";
import { getFaculties, getDepartments, Faculty, Department } from "@/services/faculties.services";
import { getStaff, Staff } from "@/services/staff.services"; // Import Staff Service

export function AddProgramDialog({ institutionId = 1, onSuccess }: { institutionId?: number, onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]); // State for staff

  // Combobox State for Coordinator
  const [openCoordinatorBox, setOpenCoordinatorBox] = useState(false);

  const initialData = {
    name: "",
    code: "",
    faculty: "",
    department: "",
    duration: "",
    level: "",
    description: "",
    coordinator: "", // Stores the name string
    student_capacity: "",
    modules: "",
    entry_requirements: "",
  };

  const [formData, setFormData] = useState(initialData);

  // --- 1. Fetch Data on Open ---
  useEffect(() => {
    if (open && institutionId) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // Fetch Faculties, Departments, AND Staff simultaneously
          const [facData, deptData, staffData] = await Promise.all([
            getFaculties(institutionId),
            getDepartments({ institution: institutionId }),
            getStaff({ institution_id: institutionId, status: 'active' }) // Only active staff
          ]);

          if (Array.isArray(facData)) setFaculties(facData);
          if (Array.isArray(deptData)) setDepartments(deptData);
          if (Array.isArray(staffData)) setStaffList(staffData);

        } catch (error) {
          console.error("Error fetching data", error);
          toast.error("Could not load dropdown lists.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, institutionId]);

  // --- 2. Filter Departments ---
  const filteredDepartments = useMemo(() => {
    if (!formData.faculty) return [];
    return departments.filter(d => d.faculty.toString() === formData.faculty);
  }, [departments, formData.faculty]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => {
        const newData = { ...prev, [field]: value };
        if (field === 'faculty') {
            newData.department = "";
        }
        return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.faculty || !formData.department) {
        toast.error("Please select both a faculty and a department.");
        setLoading(false);
        return;
      }

      const payload = {
        department: parseInt(formData.department),
        name: formData.name,
        code: formData.code,
        duration: parseInt(formData.duration),
        level: formData.level,
        description: formData.description,
        coordinator: formData.coordinator, // Sends the name string
        student_capacity: parseInt(formData.student_capacity) || 0,
        modules: formData.modules,
        entry_requirements: formData.entry_requirements,
      };

      await createProgram(payload);

      toast.success("Program added successfully!");
      setFormData(initialData);
      setOpen(false);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Failed to create program.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-visible">
        <DialogHeader>
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>Create a new academic program under a specific department.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          {/* Row 1: Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Program Name *</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g., Bachelor of Science in Computer Science" 
              required 
            />
          </div>

          {/* Row 2: Code & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Program Code *</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={handleChange} 
                placeholder="e.g. BSCS" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Years) *</Label>
              <Input 
                id="duration" 
                type="number" 
                value={formData.duration} 
                onChange={handleChange} 
                placeholder="4" 
                min="1"
                required 
              />
            </div>
          </div>

          {/* Row 3: ACADEMIC PLACEMENT */}
          <div className="p-4 bg-muted/30 rounded-md border space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Academic Placement</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty *</Label>
                    <Select 
                        value={formData.faculty} 
                        onValueChange={(val) => handleSelectChange("faculty", val)}
                        disabled={loadingData}
                        required
                    >
                        <SelectTrigger id="faculty">
                        <SelectValue placeholder={loadingData ? "Loading..." : "Select faculty"} />
                        </SelectTrigger>
                        <SelectContent>
                        {faculties.map((fac) => (
                            <SelectItem key={fac.id} value={String(fac.id)}>{fac.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                        value={formData.department} 
                        onValueChange={(val) => handleSelectChange("department", val)}
                        disabled={!formData.faculty || filteredDepartments.length === 0}
                        required
                    >
                        <SelectTrigger id="department">
                        <SelectValue placeholder={!formData.faculty ? "Select faculty first" : "Select department"} />
                        </SelectTrigger>
                        <SelectContent>
                        {filteredDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
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

          {/* Row 4: Coordinator & Level */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* --- COORDINATOR COMBOBOX --- */}
            <div className="space-y-2 flex flex-col">
              <Label>Coordinator (Optional)</Label>
              <Popover open={openCoordinatorBox} onOpenChange={setOpenCoordinatorBox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCoordinatorBox}
                    className="w-full justify-between pl-3 text-left font-normal"
                  >
                    {formData.coordinator ? (
                        <span className="flex items-center text-foreground">
                            {formData.coordinator}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">Select staff member...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search staff..." />
                    <CommandList>
                        <CommandEmpty>No staff found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            {/* Option to clear selection */}
                            <CommandItem
                                onSelect={() => {
                                    setFormData(prev => ({ ...prev, coordinator: "" }));
                                    setOpenCoordinatorBox(false);
                                }}
                                className="text-muted-foreground italic"
                            >
                                None (Clear)
                            </CommandItem>
                            
                            {staffList.map((staff) => (
                            <CommandItem
                                key={staff.id}
                                value={staff.full_name} // Search by name
                                onSelect={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        coordinator: staff.full_name 
                                    }));
                                    setOpenCoordinatorBox(false);
                                }}
                            >
                                <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.coordinator === staff.full_name ? "opacity-100" : "opacity-0"
                                )}
                                />
                                <div className="flex flex-col">
                                    <span>{staff.full_name}</span>
                                    <span className="text-xs text-muted-foreground">{staff.position}</span>
                                </div>
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select 
                value={formData.level} 
                onValueChange={(val) => handleSelectChange("level", val)}
                required
              >
                <SelectTrigger id="level"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelors">Bachelors</SelectItem>
                  <SelectItem value="Masters">Masters</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5: Capacity & Description */}
          <div className="space-y-2">
              <Label htmlFor="student_capacity">Student Capacity</Label>
              <Input 
                id="student_capacity" 
                type="number" 
                value={formData.student_capacity} 
                onChange={handleChange} 
                placeholder="100" 
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Program Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Brief description of the program..." 
              rows={3} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Adding..." : "Add Program"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}