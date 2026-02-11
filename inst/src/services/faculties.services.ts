import apiClient from "./api";

// =======================
// --- FACULTY TYPES ---
// =======================

export interface Faculty {
  id: number;
  institution: number;
  institution_name?: string;
  name: string;
  dean: string;
  location: string;
  email: string;
  description: string;
  status: 'Active' | 'Setup' | 'Review' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface FacultyStats {
  total_faculties: number;
  active_faculties: number;
}

export interface CreateFacultyData {
  institution: number;
  name: string;
  dean?: string;
  location?: string;
  email?: string;
  description?: string;
  status?: string;
}

// ==========================
// --- DEPARTMENT TYPES ---
// ==========================

export interface Department {
  id: number;
  faculty: number;
  name: string;
  code: string;
  head_of_department: string;
  description?: string;
}

export interface CreateDepartmentData {
  faculty: number;
  name: string;
  code?: string;
  head_of_department?: string;
  description?: string;
}

export interface DepartmentFilters {
  faculty?: number;
  institution?: number;
}

const FACULTY_ENDPOINT = '/faculties/faculties/';
const DEPT_ENDPOINT = '/faculties/departments/';

// ==========================
// --- FACULTY SERVICES ---
// ==========================

/**
 * Fetch faculties.
 * accepts institutionId to filter the dropdown.
 */
export const getFaculties = async (institutionId?: number): Promise<Faculty[]> => {
  const params = institutionId ? { institution: institutionId } : {};
  const response = await apiClient.get<Faculty[]>(FACULTY_ENDPOINT, { params });
  return response.data;
};

export const getFaculty = async (id: number): Promise<Faculty> => {
  const response = await apiClient.get<Faculty>(`${FACULTY_ENDPOINT}${id}/`);
  return response.data;
};

export const createFaculty = async (data: CreateFacultyData): Promise<Faculty> => {
  const response = await apiClient.post<Faculty>(FACULTY_ENDPOINT, data);
  return response.data;
};

export const updateFaculty = async (id: number, data: Partial<CreateFacultyData>): Promise<Faculty> => {
  const response = await apiClient.patch<Faculty>(`${FACULTY_ENDPOINT}${id}/`, data);
  return response.data;
};

export const deleteFaculty = async (id: number): Promise<void> => {
  await apiClient.delete(`${FACULTY_ENDPOINT}${id}/`);
};

export const getFacultyStats = async (): Promise<FacultyStats> => {
  const response = await apiClient.get<FacultyStats>(`${FACULTY_ENDPOINT}stats/`);
  return response.data;
};

// =============================
// --- DEPARTMENT SERVICES ---
// =============================

/**
 * Fetch departments.
 * Filter by faculty_id is crucial for the cascading dropdown.
 */
export const getDepartments = async (filters?: DepartmentFilters): Promise<Department[]> => {
  // Pass the filters object directly as params
  const response = await apiClient.get<Department[]>(DEPT_ENDPOINT, { params: filters });
  return response.data;
};

export const createDepartment = async (data: CreateDepartmentData): Promise<Department> => {
  const response = await apiClient.post<Department>(DEPT_ENDPOINT, data);
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await apiClient.delete(`${DEPT_ENDPOINT}${id}/`);
};

const facultyService = {
    getFaculties,
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getFacultyStats,
    // Departments
    getDepartments,
    createDepartment,
    deleteDepartment
};

export default facultyService;