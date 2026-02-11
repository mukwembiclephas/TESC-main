import apiClient from "./api";

// --- Types ---

export interface Program {
  id: number;
  
  // Hierarchy
  department: number;
  department_name?: string;   // Read-only
  faculty_name?: string;      // Read-only (via department)
  institution_name?: string;  // Read-only (via department)

  // Details
  name: string;
  code: string;
  duration: number;
  level: string;
  description: string;
  coordinator: string;
  student_capacity: number;
  modules: string;
  entry_requirements: string;
  
  created_at: string;
  updated_at: string;
}

export interface CreateProgramData {
  department: number; // Changed from 'faculty' to 'department'
  name: string;
  code: string;
  duration: number;
  level: string;
  description?: string;
  coordinator?: string;
  student_capacity?: number;
  modules?: string;
  entry_requirements?: string;
}

// Updated filters to match backend
export interface ProgramFilters {
  department_id?: number;
  faculty_id?: number;
  institution_id?: number;
}

const END_POINT = '/faculties/programs/';

// --- Service Functions ---

/**
 * Fetch all programs.
 * Supports hierarchical filtering.
 */
export const getPrograms = async (filters?: ProgramFilters) => {
  try {
    const response = await apiClient.get<Program[]>(END_POINT, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }
};

export const createProgram = async (data: CreateProgramData): Promise<Program> => {
  try {
    const response = await apiClient.post<Program>(END_POINT, data);
    return response.data;
  } catch (error) {
    console.error("Error creating program:", error);
    throw error;
  }
};

export const updateProgram = async (id: number, data: Partial<CreateProgramData>): Promise<Program> => {
  try {
    const response = await apiClient.patch<Program>(`${END_POINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating program ${id}:`, error);
    throw error;
  }
};

export const deleteProgram = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${END_POINT}${id}/`);
  } catch (error) {
    console.error(`Error deleting program ${id}:`, error);
    throw error;
  }
};

const programService = {
    getPrograms,
    createProgram,
    updateProgram,
    deleteProgram
};

export default programService;