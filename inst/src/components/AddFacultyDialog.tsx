import { useState, useEffect } from "react";
import { 
  Plus, Building2, MapPin, Mail, FileText, 
  Check, ChevronsUpDown, Loader2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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

import { createFaculty } from "@/services/faculties.services";
import { getStaff, Staff } from "@/services/staff.services";

export function AddFacultyDialog({ institutionId, onSuccess }: { institutionId: number, onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Combobox State
  const [openCombobox, setOpenCombobox] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);

  // Initial State
  const initialData = {
    name: "",
    dean: "", 
    dean_id: null as number | null, 
    location: "",
    email: "",
    status: "Active",
    description: "",
  };

  const [formData, setFormData] = useState(initialData);

  // Fetch Staff
  useEffect(() => {
    if (open && institutionId) {
      const loadStaff = async () => {
        setIsStaffLoading(true);
        try {
          const data = await getStaff({ institution_id: institutionId, status: 'active' });
          if (Array.isArray(data)) {
            setStaffList(data);
          }
        } catch (err) {
          console.error("Failed to load staff", err);
        } finally {
          setIsStaffLoading(false);
        }
      };
      loadStaff();
    }
  }, [open, institutionId]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) {
        toast.error("Institution ID missing.");
        return;
    }
    setLoading(true);

    try {
      const payload = {
        ...formData,
        institution: institutionId,
        dean: formData.dean, 
      };

      await createFaculty(payload);
      toast.success("Faculty created successfully.");
      setFormData(initialData);
      setOpen(false);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error("Failed to create faculty:", error);
      const errorMessage = error.response?.data?.detail || "Failed to create faculty.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const noStaffAvailable = !isStaffLoading && staffList.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] overflow-visible"> 
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
            <DialogDescription>
              Create a new faculty. You can assign a Dean now or later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* Faculty Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Faculty Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Faculty of Science" 
                  className="pl-9" 
                  required 
                />
              </div>
            </div>

            {/* Dean Selection (Optional) */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dean">Dean / Lead (Optional)</Label>
                {noStaffAvailable && (
                    <span className="text-[10px] text-amber-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        No staff available yet
                    </span>
                )}
              </div>
              
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    // Disable if no staff available to avoid confusion
                    disabled={noStaffAvailable}
                    className="w-full justify-between pl-3 text-left font-normal"
                  >
                    {formData.dean ? (
                       <span className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          {formData.dean}
                       </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {noStaffAvailable ? "Create staff first to assign Dean" : "Select a staff member..."}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Type name..." />
                    <CommandList>
                        <CommandGroup>
                            {staffList.map((staff) => (
                            <CommandItem
                                key={staff.id}
                                value={staff.full_name} 
                                onSelect={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        dean: staff.full_name, 
                                        dean_id: staff.id      
                                    }));
                                    setOpenCombobox(false);
                                }}
                            >
                                <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.dean_id === staff.id ? "opacity-100" : "opacity-0"
                                )}
                                />
                                {staff.full_name}
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Other Fields (Location, Email, etc) remain same... */}
            <div className="grid grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. North Wing" 
                    className="pl-9" 
                  />
                </div>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="faculty@uni.edu" 
                    className="pl-9" 
                  />
                </div>
              </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Setup">In Setup</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description..." 
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Faculty
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}