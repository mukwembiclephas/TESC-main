import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRecordPayment } from "@/hooks/useRecordPayment";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialStudentId?: string | null; // Added this prop
}

export function RecordPaymentDialog({ open, onOpenChange, onSuccess, initialStudentId }: RecordPaymentDialogProps) {
  const { formData, loading, updateField, handleSubmit } = useRecordPayment({
    onSuccess,
    onClose: onOpenChange,
    initialStudentId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {initialStudentId ? `Posting payment for ${initialStudentId}` : "Search student and post payment."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              value={formData.student_id}
              onChange={(e) => updateField("student_id", e.target.value)}
              required
              readOnly={!!initialStudentId} // Lock ID if coming from a specific row
              className={initialStudentId ? "bg-muted" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date Paid</Label>
              <Input
                id="date"
                type="date"
                value={formData.date_paid}
                onChange={(e) => updateField("date_paid", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Reference / Receipt #</Label>
            <Input
              id="ref"
              value={formData.reference}
              onChange={(e) => updateField("reference", e.target.value)}
              placeholder="e.g. Bank Ref or Receipt No."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Posting
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}