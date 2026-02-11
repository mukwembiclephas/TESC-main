import { useState, useEffect } from "react";
import { toast } from "sonner";
import { recordStudentPayment, PaymentData } from "@/services/payment.services";

interface UseRecordPaymentProps {
  onSuccess?: () => void;
  onClose?: (open: boolean) => void;
  initialStudentId?: string | null;
}

export const useRecordPayment = ({ onSuccess, onClose, initialStudentId }: UseRecordPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentData>({
    student_id: "",
    amount: "",
    reference: "",
    date_paid: new Date().toISOString().split("T")[0],
  });

  // Sync internal state if initialStudentId changes (when dialog opens)
  useEffect(() => {
    if (initialStudentId) {
      setFormData((prev) => ({ ...prev, student_id: initialStudentId }));
    }
  }, [initialStudentId]);

  const updateField = (field: keyof PaymentData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await recordStudentPayment(formData);
      toast.success(`Payment for ${formData.student_id} recorded!`);
      
      if (onSuccess) onSuccess();
      if (onClose) onClose(false);
      
      // Reset after success
      setFormData({
        student_id: "",
        amount: "",
        reference: "",
        date_paid: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error recording payment.");
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, updateField, handleSubmit };
};