import { useEffect, useState } from "react";
import { getDetailedInnovations } from "@/services/academic.service";
import type { DetailedInnovation } from "@/lib/types/academic.types";

export function useDetailedInnovations() {
  const [data, setData] = useState<DetailedInnovation[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const innovations = await getDetailedInnovations();
        if (!mounted) return;
        setData(innovations);
        console.debug("Detailed Innovations:", innovations);
      } catch (err) {
        if (!mounted) return;
        console.error("Detailed Innovations Error:", err);
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