import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createVacancy, CreateVacancyData } from "@/services/staff.services";
// Import consolidated academic services
import { getFaculties, getDepartments, Faculty, Department } from "@/services/faculties.services";

interface AddVacancyDialogProps {
  institutionId?: number;
  onVacancyAdded: () => void;
}

export function AddVacancyDialog({ institutionId, onVacancyAdded }: AddVacancyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Data State
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<CreateVacancyData>>({
    title: "",
    department: undefined, // Stores ID
    faculty: undefined,    // Stores ID
    quantity: 1,
    deadline: "",
    description: "",
  });

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (open && institutionId) {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const [facData, deptData] = await Promise.all([
            getFaculties(institutionId),
            getDepartments({ institution: institutionId })
          ]);
          setFaculties(Array.isArray(facData) ? facData : []);
          setDepartments(Array.isArray(deptData) ? deptData : []);
        } catch (error) {
          console.error("Error fetching academic data", error);
          toast.error("Could not load faculty lists.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [open, institutionId]);

  // --- 2. Filter Logic ---
  const filteredDepartments = useMemo(() => {
    if (!formData.faculty) return [];
    return departments.filter(d => d.faculty === formData.faculty);
  }, [departments, formData.faculty]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof CreateVacancyData, value: string) => {
    const val = parseInt(value);
    setFormData(prev => {
        const newData = { ...prev, [field]: val };
        // Reset dependent field
        if (field === 'faculty') {
            newData.department = undefined; 
        }
        return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) {
        toast.error("Institution ID is missing");
        return;
    }

    setLoading(true);
    try {
      if (!formData.title || !formData.faculty || !formData.department || !formData.deadline) {
          toast.error("Please fill in all required fields.");
          setLoading(false);
          return;
      }

      await createVacancy({
        title: formData.title,
        quantity: Number(formData.quantity),
        deadline: formData.deadline,
        description: formData.description,
        institution: institutionId,
        // Send IDs to backend
        faculty: formData.faculty, 
        department: formData.department,
      });
      
      toast.success("Job opening posted successfully!");
      setFormData({ title: "", department: undefined, faculty: undefined, quantity: 1, deadline: "", description: "" });
      setOpen(false);
      onVacancyAdded(); 
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Failed to post vacancy.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Post New Job Opening</DialogTitle>
          <DialogDescription>
            Create a vacancy record for recruitment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Senior Lecturer" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            {/* Faculty Select */}
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select 
                value={formData.faculty ? String(formData.faculty) : ""} 
                onValueChange={(val) => handleSelectChange('faculty', val)}
                disabled={loadingData}
              >
                <SelectTrigger id="faculty">
                  <SelectValue placeholder={loadingData ? "Loading..." : "Select Faculty"} />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((fac) => (
                    <SelectItem key={fac.id} value={String(fac.id)}>{fac.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department Select */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department ? String(formData.department) : ""} 
                onValueChange={(val) => handleSelectChange('department', val)}
                disabled={!formData.faculty || filteredDepartments.length === 0}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder={!formData.faculty ? "Select Faculty first" : "Select Department"} />
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

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Positions Available</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="1" 
                value={formData.quantity} 
                onChange={handleChange} 
                required 
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input 
                id="deadline" 
                type="date" 
                value={formData.deadline} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            {/* Description */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea 
                id="description" 
                placeholder="Brief details about the role..." 
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Posting..." : "Post Vacancy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}