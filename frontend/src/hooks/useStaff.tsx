import { useState, useEffect } from "react";

import { getStaffSummary } from "@/services/academic.service";

import type { StaffSummaryStats } from "@/lib/types/academic.types";



export function useStaffStatistics(institutionId?: number) {

  const [data, setData] = useState<StaffSummaryStats | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<any>(null);



  useEffect(() => {

    let mounted = true;



    async function load() {

      try {

        setLoading(true);

        // Fetches KPIs (total/active) and Charts (position/faculty)

        const stats = await getStaffSummary(institutionId);

       

        if (!mounted) return;

        setData(stats);

        setError(null);

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

  }, [institutionId]); // Re-runs if the institution filter changes



  return { data, loading, error };

}