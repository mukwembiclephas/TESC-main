import apiClient from "./api";
import { 
  Program, 
  Facility, 
  Staff, 
  StaffWriteData, 
  StaffSummaryStats,
  PaginatedResponse 
} from "@/lib/types/academic.types";

// --- Facility & Program ---
export const getAllFacilities = async (): Promise<Facility[]> => {
  const response = await apiClient.get<Facility[]>("/academic/facilities/");
  return response.data;
};

export const getAllPrograms = async (): Promise<Program[]> => {
  const response = await apiClient.get<Program[]>("/academic/programs/");
  return response.data;
};

export const getProgramsByInstitution = async (institutionId: number): Promise<Program[]> => {
  const response = await apiClient.get<Program[]>("/academic/programs/", {
    params: { institution_id: institutionId },
  });
  return response.data;
};

// --- Staff Endpoints ---

/** Fetch Summary Stats for Dashboard */
export const getStaffSummary = async (institutionId?: number): Promise<StaffSummaryStats> => {
  const response = await apiClient.get<StaffSummaryStats>("/staff/members/summary-stats/", {
    params: { institution_id: institutionId },
  });
  return response.data;
};

/** Fetch All Staff (Paginated) */
export const getAllStaff = async (
  page: number = 1, 
  pageSize: number = 25,
  search?: string
): Promise<PaginatedResponse<Staff>> => {
  const response = await apiClient.get<PaginatedResponse<Staff>>("/staff/members/", {
    params: { page, page_size: pageSize, search },
  });
  return response.data;
};

export const getStaffById = async (id: number): Promise<Staff> => {
  const response = await apiClient.get<Staff>(`/staff/members/${id}/`);
  return response.data;
};

export const createStaff = async (staffData: StaffWriteData): Promise<Staff> => {
  const response = await apiClient.post<Staff>("/staff/members/", staffData);
  return response.data;
};

export const updateStaff = async (id: number, staffData: StaffWriteData): Promise<Staff> => {
  const response = await apiClient.put<Staff>(`/staff/members/${id}/`, staffData);
  return response.data;
};

export const deleteStaff = async (id: number): Promise<void> => {
  await apiClient.delete(`/staff/members/${id}/`);
};

/** Bulk Upload */
export const bulkUploadStaff = async (file: File, institutionId: number) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("institution_id", institutionId.toString());

  const response = await apiClient.post("/staff/members/bulk_upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};