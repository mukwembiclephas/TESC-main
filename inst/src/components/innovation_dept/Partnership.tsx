import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from "sonner";
import { createPartnership, updatePartnership } from "@/services/innovation.services";

interface PartnershipFormProps {
  partnership?: any; // For Edit Mode
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const PartnershipFormDialog = ({ partnership, trigger, onSuccess }: PartnershipFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const institutionId = user?.institution?.id || user?.institution_id;
  const isEditing = !!partnership;

  const initialData = {
    partner_name: '', 
    focus_area: '', 
    agreement_date: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (open) {
      if (partnership) {
        setFormData({
            partner_name: partnership.partner_name,
            focus_area: partnership.focus_area,
            agreement_date: partnership.agreement_date,
            status: partnership.status || 'Active'
        });
      } else {
        setFormData(initialData);
      }
    }
  }, [open, partnership]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, institution: institutionId };
      
      if (isEditing) {
        
        await updatePartnership(partnership.id, payload);
        toast.success("Partnership updated");
      } else {
        await createPartnership(payload);
        toast.success("Partnership recorded");
      }
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(isEditing ? "Failed to update partnership" : "Failed to add partnership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4"/> New Partner
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Partnership" : "Add Strategic Partner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
             <Label>Partner Organization Name</Label>
             <Input 
               required 
               value={formData.partner_name} 
               onChange={e => setFormData({...formData, partner_name: e.target.value})} 
               placeholder="e.g. Microsoft for Startups"
             />
          </div>
          <div className="space-y-2">
             <Label>Focus Area / Scope</Label>
             <Input 
               required 
               value={formData.focus_area} 
               onChange={e => setFormData({...formData, focus_area: e.target.value})} 
               placeholder="e.g. Cloud Infrastructure, Funding"
             />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Agreement Date</Label>
                <Input 
                  type="date" 
                  required 
                  value={formData.agreement_date} 
                  onChange={e => setFormData({...formData, agreement_date: e.target.value})} 
                />
            </div>
            <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={val => setFormData({...formData, status: val})}
                >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Concluded">Concluded</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : (isEditing ? "Update Partnership" : "Save Partnership")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
