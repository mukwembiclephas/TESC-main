import { useEffect, useState } from "react";
import { analysisService } from "@/services/analysis.services";
import type { EnrollmentTrendItem } from "@/lib/types/dashboard.types";

export function useEnrollmentTrends() {
  const [data, setData] = useState<EnrollmentTrendItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const trends = await analysisService.getEnrollmentTrends();
        if (!mounted) return;
        setData(trends);
        console.debug("Enrollment Trends:", trends);
      } catch (err) {
        if (!mounted) return;
        console.error("Enrollment Trends Error:", err);
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

  return { data, loading, error };
}
