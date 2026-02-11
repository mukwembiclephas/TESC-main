import { useState, useEffect } from "react";
import { analysisService } from "@/services/analysis.services";
import type { StudentTeacherRatioItem } from "@/lib/types/dashboard.types";

export function useStudentTeacherRatio() {
  const [data, setData] = useState<StudentTeacherRatioItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const stats = await analysisService.getStudentTeacherRatio();
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
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}
