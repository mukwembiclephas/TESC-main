// hooks/useSpecialEnrollment.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { getSpecialEnrollmentStats, SpecialStats } from "@/services/analysis.services";

const COLOR_MAP: Record<string, string> = {
  Physical: "hsl(var(--primary))",
  Albino: "hsl(var(--accent))",
  Hearing: "hsl(var(--info))",
  Visual: "hsl(var(--warning))",
};

export const useSpecialEnrollment = () => {
  const [data, setData] = useState<SpecialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSpecialEnrollmentStats(); // No ID needed for global view
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to load national enrollment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pieData = useMemo(() => {
    if (!data?.special_students) return [];
    return data.special_students.map((item) => ({
      name: item.disability_type,
      value: item.value,
      color: COLOR_MAP[item.disability_type] || "hsl(var(--muted))",
    }));
  }, [data]);

  return { data, pieData, loading, error, refresh: fetchData };
};