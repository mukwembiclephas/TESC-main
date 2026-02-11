// SupportEditDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateStudent, Student } from "@/services/students.services";

interface SupportEditDialogProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupportEditDialog = ({ student, onClose, onSuccess }: SupportEditDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    is_iseop: (student as any).is_iseop || false,
    disability_type: (student as any).disability_type || "None",
    is_work_for_fees: (student as any).is_work_for_fees || false,
    work_area: (student as any).work_area || "",
    hours_pledged: (student as any).hours_pledged || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStudent(student.id, {
        ...formData,
        // Ensure work data is nullified if work-for-fees is disabled
        work_area: formData.is_work_for_fees ? formData.work_area : null,
        hours_pledged: formData.is_work_for_fees ? formData.hours_pledged : 0,
      } as any);
      
      toast.success("Support details updated");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update support details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Support: {student.full_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* ISEOP Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>ISEOP Program</Label>
              <p className="text-xs text-muted-foreground">Is this student enrolled in ISEOP?</p>
            </div>
            <Switch 
              checked={formData.is_iseop} 
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_iseop: checked }))} 
            />
          </div>

          {/* Disability Status */}
          <div className="space-y-2">
            <Label>Disability Category</Label>
            <Select 
              value={formData.disability_type} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, disability_type: val }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Physical">Physically Disabled</SelectItem>
                <SelectItem value="Albino">Albino</SelectItem>
                <SelectItem value="Visual">Visually Impaired</SelectItem>
                <SelectItem value="Hearing">Hearing Impaired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work for Fees Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-blue-600">Work-for-Fees Program</Label>
              <Switch 
                checked={formData.is_work_for_fees} 
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_work_for_fees: checked }))} 
              />
            </div>

            {formData.is_work_for_fees && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label>Service Area</Label>
                  <Select 
                    value={formData.work_area} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, work_area: val }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Library">Library Assistant</SelectItem>
                      <SelectItem value="Grounds">Grounds Maintenance</SelectItem>
                      <SelectItem value="Labs">Labs Assistant</SelectItem>
                      <SelectItem value="Admin">Admin Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hours Pledged</Label>
                  <Input 
                    type="number" 
                    value={formData.hours_pledged} 
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_pledged: parseInt(e.target.value) }))} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Support Details
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};