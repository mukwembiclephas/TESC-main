// hooks/useInnovationAnalytics.ts
import { useState, useEffect } from "react";
import { InnovationAnalyticsService } from "@/services/innovation.services";
import type { DashboardInnovationStats, DetailedInnovation } from "@/lib/types/academic.types";

/**
 * Hook to fetch aggregated innovation dashboard stats
 */
export const useInnovationStats = () => {
  const [data, setData] = useState<DashboardInnovationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const stats = await InnovationAnalyticsService.getInnovationStats();
        if (!mounted) return;
        setData(stats);
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};

/**
 * Hook to fetch detailed innovation project list
 */
export const useDetailedInnovations = () => {
  const [data, setData] = useState<DetailedInnovation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const projects = await InnovationAnalyticsService.getDetailedInnovations();
        if (!mounted) return;
        setData(projects);
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};
