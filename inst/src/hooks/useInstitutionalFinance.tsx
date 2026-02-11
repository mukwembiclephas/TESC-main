// hooks/useInstitutionalFinance.ts
import { useState, useEffect, useCallback } from "react";
import { getInstitutionalFinanceData } from "@/services/payment.services";
import { FinancialStats } from "@/services/analysis.services";
import { useAuth } from "@/context/AuthContext";
export const useInstitutionalFinance = () => {
  const [data, setData] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user?.institution?.id) return;
    setLoading(true);
    try {
      const result = await getInstitutionalFinanceData(user.institution.id);
      setData(result);
    } catch (error) {
      console.error("Finance Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.institution?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, refresh: fetchData };
};