// src/hooks/useStatistics.ts
import { useState, useEffect } from "react";
import { analysisService } from "@/services/analysis.services";
import type { DashboardStats } from "@/lib/types/dashboard.types";

export function useStatistics() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
  let mounted = true;

  async function load() {
    try {
      const stats = await analysisService.getAnalysisStats();
      if (!mounted) return;
      setData(stats);
    } catch (err) {
      if (!mounted) return;
      setError(err);
    } finally {
      if (!mounted) return;
      setLoading(false);
    }
  }

  load();

  return () => {
    mounted = false;
  };
}, []);

return { data, loading, error }
}