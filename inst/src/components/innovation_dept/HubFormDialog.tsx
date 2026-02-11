import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from "sonner";
import { createHub, updateHub } from "@/services/innovation.services"; // Make sure updateHub is imported

interface HubFormProps {
    hub?: any; // For Edit Mode
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export const HubFormDialog = ({ hub, trigger, onSuccess }: HubFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!hub;

  // Initial State (Removed 'services')
  const initialData = {
    name: "",
    capacity: 0,
    occupied: 0,
    status: "Medium",
  };

  const [formData, setFormData] = useState(initialData);

  // Load data on open
  useEffect(() => {
     if (open) {
        if (hub) {
            setFormData({
                name: hub.name,
                capacity: hub.capacity,
                occupied: hub.occupied,
                status: hub.status
            });
        } else {
            setFormData(initialData);
        }
     }
  }, [open, hub]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, institution: institutionId };
      
      if (isEditing) {
         // @ts-ignore - Assuming you have updateHub in your services
         await updateHub(hub.id, payload);
         toast.success("Hub updated successfully");
      } else {
         await createHub(payload);
         toast.success("Hub added successfully");
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(isEditing ? "Failed to update hub" : "Failed to add hub");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
            <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Hub
            </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Innovation Hub" : "Add Innovation Hub"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Hub Name</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Engineering FabLab"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                required
                min="0"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Occupied Units</Label>
              <Input
                type="number"
                required
                min="0"
                value={formData.occupied}
                onChange={(e) => setFormData({ ...formData, occupied: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High Activity</SelectItem>
                <SelectItem value="Medium">Medium Activity</SelectItem>
                <SelectItem value="Full">Full Capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : (isEditing ? "Update Hub" : "Create Hub")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};