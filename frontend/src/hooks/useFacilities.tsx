// src/hooks/useFacilitiesStats.ts
import { useState, useEffect } from "react";
import { getAllFacilities } from "@/services/academic.service";

export interface Facility {
  id: number;
  institution: number;
  institution_name: string;
  name: string;
  facility_type: string;
  building: string;
  capacity: number;
  current_usage:number;
  status: string;
  description?: string;
  equipment?: string;
  manager?: string;
  contact_number?: string;
}

export function useFacilities() {
  const [data, setData] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadFacilities() {
      try {
        const res = await getAllFacilities()
        setData(res);
      } catch (err: any) {
        if (!mounted) return;
        console.error("Error fetching facilities:", err);
        setError(err.message || "Unknown error");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadFacilities();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}