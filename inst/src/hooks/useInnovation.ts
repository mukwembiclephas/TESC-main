import { useState, useEffect, useCallback } from 'react';
import { 
  getProjects, getHubs, getPartnerships, getGrants,
  Project, InnovationHub, Partnership, ResearchGrant 
} from '@/services/innovation.services';
import { toast } from 'sonner';

export const useInnovationData = (institutionId: number | undefined) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hubs, setHubs] = useState<InnovationHub[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [grants, setGrants] = useState<ResearchGrant[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!institutionId) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel for speed
      const [projectsData, hubsData, partnershipsData, grantsData] = await Promise.all([
        getProjects({ institution_id: institutionId }),
        getHubs({ institution_id: institutionId }),
        getPartnerships({ institution_id: institutionId }),
        getGrants({ institution_id: institutionId }),
      ]);

      setProjects(projectsData);
      setHubs(hubsData);
      setPartnerships(partnershipsData);
      setGrants(grantsData);
    } catch (err) {
      console.error("Failed to load innovation data", err);
      setError("Failed to load dashboard data");
      toast.error("Could not load innovation data.");
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    projects,
    hubs,
    partnerships,
    grants,
    loading,
    error,
    refresh: fetchData // Expose this function to reload data after a form submission
  };
};