import { useState, useEffect } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createFacility, CreateFacilityData } from "@/services/facilities.services";
import { useAuth } from "@/context/AuthContext";

export function AddFacilityDialog({ onFacilityAdded }: { onFacilityAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); 

  // FIX: Safely extract institution ID from nested object OR flat field
  // Handles: { institution: { id: 1 } } AND { institution_id: 1 }
  const institutionId = user?.institution?.id || user?.institution_id;

  // Form State
  const [formData, setFormData] = useState<Partial<CreateFacilityData>>({
    status: 'Active',
    facility_type: '',
    institution: institutionId,// Set initial value if user is already loaded
    capacity: 0,
    current_usage: 0,
  });

  // Watch for user data to load and update state
  useEffect(() => {
    if (institutionId) {
      setFormData(prev => ({ ...prev, institution: institutionId }));
    }
  }, [institutionId]);

  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { id, value } = e.target;

  const numericFields = ['capacity', 'current_usage'];
  const val = numericFields.includes(id) ? parseInt(value) || 0 : value;

  setFormData(prev => ({ ...prev, [id]: val }));
};


  const handleSelectChange = (field: keyof CreateFacilityData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!institutionId) {
        toast.error("Institution ID not found. Please reload or log in again.");
        setIsLoading(false);
        return;
      }

      if (!formData.name || !formData.facility_type || !formData.capacity) {
        toast.error("Please fill in required fields");
        setIsLoading(false);
        return;
      }

      // Ensure institution ID is present in payload
      const payload = {
        ...formData,
        institution: institutionId 
      } as CreateFacilityData;

      await createFacility(payload);
      
      toast.success("Facility added successfully!");
      setOpen(false);
      
      // Reset form, keeping the institution ID
      setFormData({ 
        institution: institutionId, 
        status: 'Active', 
        facility_type: '' 
      });
      
      if (onFacilityAdded) onFacilityAdded();

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to add facility.";
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
          Add Facility
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Facility</DialogTitle>
          <DialogDescription>Register a new institutional facility</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Facility Name *</Label>
            <Input id="name" placeholder="e.g., Computer Lab A" required onChange={handleInputChange} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facility_type">Facility Type *</Label>
              <Select onValueChange={(val) => handleSelectChange('facility_type', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Sports">Sports Facility</SelectItem>
                  <SelectItem value="Innovation">Innovation Center</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="building">Building *</Label>
              <Input id="building" placeholder="Building name/number" required onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input id="capacity" type="number" placeholder="50" required onChange={handleInputChange} />
            </div>

          <div className="space-y-2">
    <Label htmlFor="current_usage">Current Usage</Label>
    <Input
      id="current_usage"
      type="number"
      min={0}
      placeholder="e.g. 35"
      onChange={handleInputChange}
    />
  </div>


            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(val) => handleSelectChange('status', val)} defaultValue="Active">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Maintenance">Under Maintenance</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description of the facility" rows={3} onChange={handleInputChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Available Equipment (comma-separated)</Label>
            <Textarea 
              id="equipment" 
              placeholder="e.g., Computers, Projectors, Whiteboard" 
              rows={2} 
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Facility Manager</Label>
              <Input id="manager" placeholder="Manager name" onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number</Label>
              <Input id="contact_number" type="tel" placeholder="+263 77 123 4567" onChange={handleInputChange} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Facility
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}