import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from "sonner";
import { createGrant, updateGrant, getProjects } from "@/services/innovation.services";
interface GrantFormProps {
  grant?: any; // For Edit Mode
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const GrantFormDialog = ({ grant, trigger, onSuccess }: GrantFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!grant;

  const initialData = {
    donor: "",
    project: "",
    amount: 0,
    date_awarded: "",
  };

  const [formData, setFormData] = useState(initialData);

  // Load Projects & Edit Data
  useEffect(() => {
    if (open && institutionId) {
      // 1. Fetch Projects for dropdown
      getProjects({ institution_id: institutionId })
        .then(setProjects)
        .catch(console.error);

      // 2. Populate form if editing
      if (grant) {
        setFormData({
            donor: grant.donor,
            project: grant.project ? String(grant.project) : "", // Ensure string for Select
            amount: grant.amount,
            date_awarded: grant.date_awarded
        });
      } else {
        setFormData(initialData);
      }
    }
  }, [open, institutionId, grant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, institution: institutionId };
      
      if (isEditing) {
        await updateGrant(grant.id, payload);
        toast.success("Grant updated successfully");
      } else {
        await createGrant(payload);
        toast.success("Grant recorded successfully");
      }
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(isEditing ? "Failed to update grant" : "Failed to record grant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Log Grant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Research Grant" : "Log Research Grant"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Donor / Organization</Label>
            <Input
              required
              placeholder="e.g. UNICEF, Government Fund"
              value={formData.donor}
              onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Linked Project</Label>
            <Select
              value={formData.project}
              onValueChange={(val) => setFormData({ ...formData, project: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Awarded</Label>
              <Input
                type="date"
                required
                value={formData.date_awarded}
                onChange={(e) => setFormData({ ...formData, date_awarded: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : (isEditing ? "Update Grant" : "Save Grant")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};