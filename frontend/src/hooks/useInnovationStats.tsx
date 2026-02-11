import { useState, useEffect } from "react";
import { getInnovationStats } from "@/services/academic.service";
import type { DashboardInnovationStats } from "@/lib/types/academic.types";

export function useInnovationStats() {
  const [data, setData] = useState<DashboardInnovationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const stats = await getInnovationStats();
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

  return { data, loading, error };
}