import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
// Assuming you renamed the service or created a new one for the 'Project' model
import { createProject } from "@/services/innovation.services"; 

interface ProjectFormDialogProps {
  onSuccess?: () => void;
}

export function ProjectFormDialog({ onSuccess }: ProjectFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // @ts-ignore
  const institutionId = user?.institution?.id || user?.institution_id;

  // Initial State matching Django Project Model
  const initialData = {
    institution: institutionId,
    name: '',
    team_name: '',
    sector: '',
    location_category: 'Urban',
    stage: 'ideation',
    problem_statement: '',
    proposed_solution: '',
    revenue_generated: 0.00,
    funding_acquired: 0.00,
    jobs_created: 0
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (institutionId) {
      setFormData(prev => ({ ...prev, institution: institutionId }));
    }
  }, [institutionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    // Handle number inputs for commercial stats
    if (type === 'number') {
        setFormData(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!institutionId) {
        toast.error("Institution ID missing. Please log in again.");
        return;
      }

      // Basic validation
      if (!formData.name || !formData.sector || !formData.problem_statement) {
        toast.error("Please fill in all required fields marked with *");
        setIsLoading(false);
        return;
      }

      await createProject(formData);
      
      toast.success("Project created successfully!");
      setOpen(false);
      setFormData({ ...initialData, institution: institutionId }); // Reset
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || "Failed to create project.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Innovation / Project</DialogTitle>
          <DialogDescription>
            Register a new innovation, startup, or industrial project.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- Core Info --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input 
                id="name" 
                value={formData.name}
                placeholder="e.g., Smart Irrigation System" 
                required 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_name">Team Name</Label>
              <Input 
                id="team_name" 
                value={formData.team_name}
                placeholder="e.g. AgriSolvers" 
                onChange={handleInputChange} 
              />
            </div>
          </div>

          {/* --- Classification --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sector *</Label>
              <Select onValueChange={(val) => handleSelectChange('sector', val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agritech">Agriculture / AgriTech</SelectItem>
                  <SelectItem value="edtech">Education / EdTech</SelectItem>
                  <SelectItem value="healthtech">Health / BioTech</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="mining">Mining & Engineering</SelectItem>
                  <SelectItem value="energy">Green Energy</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location Category</Label>
              <Select 
                onValueChange={(val) => handleSelectChange('location_category', val)} 
                defaultValue="Urban"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urban">Urban</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- Lifecycle --- */}
          <div className="space-y-2">
              <Label>Current Stage</Label>
              <Select 
                onValueChange={(val) => handleSelectChange('stage', val)} 
                defaultValue="ideation"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ideation">Ideation</SelectItem>
                  <SelectItem value="prototype">Prototyping</SelectItem>
                  <SelectItem value="incubation">Incubation</SelectItem>
                  <SelectItem value="market_ready">Market Ready</SelectItem>
                  <SelectItem value="scaling">Scaling / Startup</SelectItem>
                  <SelectItem value="industrial">Industrialised</SelectItem>
                </SelectContent>
              </Select>
            </div>

          {/* --- Description --- */}
          <div className="space-y-2">
            <Label htmlFor="problem_statement">Problem Statement *</Label>
            <Textarea
              id="problem_statement"
              value={formData.problem_statement}
              placeholder="What problem are you solving?"
              rows={3}
              required
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proposed_solution">Proposed Solution</Label>
            <Textarea
              id="proposed_solution"
              value={formData.proposed_solution}
              placeholder="Technical description of the solution"
              rows={3}
              onChange={handleInputChange}
            />
          </div>

          {/* --- Commercial Stats --- */}
          <div className="rounded-md border p-4 bg-muted/20">
            <Label className="mb-2 block font-semibold">Commercial Impact (Optional)</Label>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="revenue_generated" className="text-xs">Revenue ($)</Label>
                    <Input 
                        id="revenue_generated" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        value={formData.revenue_generated}
                        onChange={handleInputChange} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="funding_acquired" className="text-xs">Funding ($)</Label>
                    <Input 
                        id="funding_acquired" 
                        type="number" 
                        step="0.01" 
                        min="0"
                        value={formData.funding_acquired}
                        onChange={handleInputChange} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="jobs_created" className="text-xs">Jobs Created</Label>
                    <Input 
                        id="jobs_created" 
                        type="number" 
                        min="0"
                        value={formData.jobs_created}
                        onChange={handleInputChange} 
                    />
                </div>
            </div>
          </div>

          {/* --- Actions --- */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}