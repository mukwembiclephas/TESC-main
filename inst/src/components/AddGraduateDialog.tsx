import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";

interface AddGraduateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGraduateDialog({ open, onOpenChange }: AddGraduateDialogProps) {
  const [formData, setFormData] = useState({
    year: "",
    program: "",
    level: "",
    distinction: "",
    credit: "",
    pass: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Graduation batch added successfully!");
    onOpenChange(false);
    setFormData({
      year: "",
      program: "",
      level: "",
      distinction: "",
      credit: "",
      pass: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Graduation Batch</DialogTitle>
          <DialogDescription>
            Record a new graduation batch for your institution
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="eng">Engineering</SelectItem>
                  <SelectItem value="bus">Business Studies</SelectItem>
                  <SelectItem value="it">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nc">National Certificate</SelectItem>
                <SelectItem value="nd">National Diploma</SelectItem>
                <SelectItem value="hnd">Higher National Diploma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distinction">Distinction</Label>
              <Input
                id="distinction"
                type="number"
                placeholder="0"
                value={formData.distinction}
                onChange={(e) => setFormData({ ...formData, distinction: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit">Credit</Label>
              <Input
                id="credit"
                type="number"
                placeholder="0"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Pass</Label>
              <Input
                id="pass"
                type="number"
                placeholder="0"
                value={formData.pass}
                onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Graduation Batch</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}