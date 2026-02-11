import apiClient from "./api";

// --- Types ---

export type FacilityType = 'Accommodation' | 'Laboratory' | 'Library' | 'Sports' | 'Innovation' | 'Other';
export type FacilityStatus = 'Active' | 'Maintenance' | 'Inactive';

export interface Facility {
  id: number;
  institution: number;
  institution_name: string; // Read-only
  name: string;
  facility_type: FacilityType;
  building: string;
  capacity: number;
  current_usage:number;
  status: FacilityStatus;
  description: string;
  equipment: string; // Comma-separated string
  manager: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityData {
  institution: number;
  name: string;
  facility_type: string; // Passed as string from select
  building: string;
  capacity: number;
  current_usage:number;
  status: string;
  description: string;
  equipment?: string;
  manager: string;
  contact_number: string;
}

export interface FacilityFilters {
  institution_id?: number;
  type?: string;
  search?: string; // Search by name, building, manager
}

const END_POINT = '/academic/facilities/';

// --- Service Functions ---

/**
 * Fetch all facilities.
 * Supports filtering by institution, type, or search query.
 */
export const getFacilities = async (filters?: FacilityFilters) => {
  try {
    const response = await apiClient.get<Facility[]>(END_POINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
};

/**
 * Get a single facility by ID.
 */
export const getFacilityById = async (id: number) => {
  try {
    const response = await apiClient.get<Facility>(`${END_POINT}${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching facility ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new facility.
 */
export const createFacility = async (data: CreateFacilityData): Promise<Facility> => {
  try {
    const response = await apiClient.post<Facility>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating facility:", error);
    throw error;
  }
};

/**
 * Update a facility's information.
 */
export const updateFacility = async (id: number, data: Partial<CreateFacilityData>): Promise<Facility> => {
  try {
    const response = await apiClient.patch<Facility>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating facility ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a facility.
 */
export const deleteFacility = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${END_POINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting facility ${id}:`, error);
    throw error;
  }
};

const facilityService = {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility
};

export default facilityService;