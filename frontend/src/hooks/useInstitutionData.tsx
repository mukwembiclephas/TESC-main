// hooks/useInstitutionData.ts
import { useQuery } from "@tanstack/react-query";
import { getAllInstitutions } from "@/services/institution.service";
import { getAllFacilities } from "@/services/academic.service";

export const useInstitutionData = () => {
  const institutionsQuery = useQuery({
    queryKey: ["institutions"],
    queryFn: getAllInstitutions,
  });

  const facilitiesQuery = useQuery({
    queryKey: ["facilities"],
    queryFn: getAllFacilities,
  });

  const isLoading = institutionsQuery.isLoading || facilitiesQuery.isLoading;

  const institutions = institutionsQuery.data || [];
  const facilities = facilitiesQuery.data || [];

  // Compute totals for key metrics
  const totalCapacity = institutions.reduce((sum, i) => sum + (i.capacity || 0), 0);
  const totalEnrolled = institutions.reduce((sum, i) => sum + (i.students_count || 0), 0);
  const utilization = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;
  const totalHostelBeds = facilities
    .filter((f) => f.type === "Hostel")
    .reduce((sum, f) => sum + (f.capacity || 0), 0);

  // Prepare chart data for capacity vs enrolled by institution type
  const capacityData = ["Polytechnic", "Teachers College", "Industrial Training"].map((type) => {
    const typeInstitutions = institutions.filter((i) => i.type === type);
    return {
      name: type,
      Capacity: typeInstitutions.reduce((sum, i) => sum + (i.capacity || 0), 0),
      Enrolled: typeInstitutions.reduce((sum, i) => sum + (i.students_count || 0), 0),
    };
  });

  return {
    institutions,
    facilities,
    totalCapacity,
    totalEnrolled,
    utilization,
    totalHostelBeds,
    capacityData,
    isLoading,
  };
};