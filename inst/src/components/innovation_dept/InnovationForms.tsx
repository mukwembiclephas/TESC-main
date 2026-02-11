import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Edit, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  createProject, 
  updateProject, 
  createHub, 
  createPartnership, 
  createGrant, 
  getProjects,
  getHubs // Ensure this is imported
} from "@/services/innovation.services"; 

// --- 1. PROJECT FORM (Handles Create & Edit) ---
interface ProjectFormProps {
  project?: any; // If provided, we are in EDIT mode
  trigger?: React.ReactNode; // Custom trigger button
  onSuccess?: () => void;
}

export const ProjectFormDialog = ({ project, trigger, onSuccess }: ProjectFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hubs, setHubs] = useState<any[]>([]);
  const { user } = useAuth();
  
  // @ts-ignore
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!project;

  const initialData = {
    institution: institutionId,
    hub: null, // New field for Hub Linkage
    name: '', 
    team_name: '', 
    sector: '', 
    location_category: 'Urban',
    stage: 'ideation', 
    problem_statement: '', 
    proposed_solution: '',
    revenue_generated: 0, 
    funding_acquired: 0, 
    jobs_created: 0
  };

  const [formData, setFormData] = useState(initialData);

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      // 1. Fetch Hubs for the dropdown
      if (institutionId) {
        getHubs({ institution_id: institutionId }).then(setHubs).catch(console.error);
      }

      // 2. If Editing, populate form
      if (project) {
        setFormData({
          institution: project.institution,
          hub: project.hub,
          name: project.name,
          team_name: project.team_name,
          sector: project.sector,
          location_category: project.location_category || 'Urban',
          stage: project.stage,
          problem_statement: project.problem_statement,
          proposed_solution: project.proposed_solution,
          revenue_generated: project.revenue_generated,
          funding_acquired: project.funding_acquired,
          jobs_created: project.jobs_created
        });
      } else {
        setFormData({ ...initialData, institution: institutionId });
      }
    }
  }, [open, project, institutionId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await updateProject(project.id, formData);
        toast.success("Project updated successfully");
      } else {
        await createProject({ ...formData, institution: institutionId });
        toast.success("Project created successfully");
      }
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update project" : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button>
            <Plus className="mr-2 h-4 w-4"/> Add Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Project Details" : "New Innovation Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Row 1: Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input required value={formData.name} onChange={e => handleChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input value={formData.team_name} onChange={e => handleChange('team_name', e.target.value)} />
            </div>
          </div>

          {/* Row 2: Classification */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sector *</Label>
              <Select value={formData.sector} onValueChange={val => handleChange('sector', val)}>
                <SelectTrigger><SelectValue placeholder="Select Sector" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agritech">AgriTech</SelectItem>
                  <SelectItem value="edtech">EdTech</SelectItem>
                  <SelectItem value="healthtech">HealthTech</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="mining">Mining</SelectItem>
                  <SelectItem value="energy">Green Energy</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={formData.stage} onValueChange={val => handleChange('stage', val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div className="space-y-2">
              <Label>Assigned Hub</Label>
              <Select 
                value={formData.hub ? String(formData.hub) : "none"} 
                onValueChange={val => handleChange('hub', val === "none" ? null : parseInt(val))}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Hub Assigned --</SelectItem>
                  {hubs.map((h) => (
                    <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Problem Statement *</Label>
            <Textarea required value={formData.problem_statement} onChange={e => handleChange('problem_statement', e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Proposed Solution</Label>
            <Textarea value={formData.proposed_solution} onChange={e => handleChange('proposed_solution', e.target.value)} rows={2} />
          </div>

          {/* Metrics Section */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4 bg-muted/30 p-4 rounded-md">
            <div className="space-y-2">
               <Label className="text-xs font-semibold">Revenue Generated ($)</Label>
               <Input type="number" step="0.01" value={formData.revenue_generated} onChange={e => handleChange('revenue_generated', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
               <Label className="text-xs font-semibold">Funding Acquired ($)</Label>
               <Input type="number" step="0.01" value={formData.funding_acquired} onChange={e => handleChange('funding_acquired', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
               <Label className="text-xs font-semibold">Jobs Created</Label>
               <Input type="number" value={formData.jobs_created} onChange={e => handleChange('jobs_created', parseInt(e.target.value))} />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : (
              <><Save className="w-4 h-4 mr-2" /> {isEditing ? "Update Project" : "Create Project"}</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};