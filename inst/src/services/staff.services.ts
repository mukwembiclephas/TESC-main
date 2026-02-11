import apiClient from "./api";
import * as XLSX from "xlsx"; // Import SheetJS
import { Staff, StaffFilters, PaginatedResponse, CreateStaffData, Vacancy } from "@/lib/types/academic.types";
// --- Types ---

export interface Staff {
  id: number;
  user?: number | null;
  institution: number;
  institution_name: string;
  faculty?: number | null;
  faculty_name?: string;
  department?: number | null; // Added based on recent changes
  department_name?: string;   // Added based on recent changes
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  employee_id: string;
  position: string;
  qualification: string;
  specialization: string;
  date_joined: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffData {
  institution: number;
  faculty?: number; // Optional
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_id: string;
  position: string;
  department: string;
  qualification: string;
  specialization?: string;
  date_joined: string;
  is_active?: boolean;
}

export interface Vacancy {
  id: number;
  institution: number;
  title: string;
  department: string;
  faculty?: string;
  quantity: number;
  deadline: string; // YYYY-MM-DD
  description?: string;
  status: 'Open' | 'Closed';
  created_at: string;
}

export interface CreateVacancyData {
  institution: number;
  title: string;
  department: string;
  faculty?: string;
  quantity: number;
  deadline: string;
  description?: string;
}

export interface StaffFilters {
  institution_id?: number;
  faculty_id?: number;
  status?: 'active' | 'inactive';
  search?: string; // Search by name, email, employee_id
}

// --- Endpoints ---
const END_POINT = '/staff/members/';
const VACANCY_ENDPOINT = '/staff/vacancies/';

// --- Staff Services ---
export const getStaff = async (
  filters?: StaffFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<Staff>> => {
  const response = await apiClient.get<PaginatedResponse<Staff>>(END_POINT, {
    params: { ...filters, page, page_size: pageSize },
  });
  return response.data; // contains count, next, previous, results
};

export const getStaffById = async (id: number) => {
  const response = await apiClient.get<Staff>(`${END_POINT}${id}/`);
  return response.data;
};

export const createStaff = async (data: CreateStaffData): Promise<Staff> => {
  const response = await apiClient.post<Staff>(END_POINT, data);
  return response.data;
};

export const updateStaff = async (id: number, data: Partial<CreateStaffData>): Promise<Staff> => {
  const response = await apiClient.patch<Staff>(`${END_POINT}${id}/`, data);
  return response.data;
};

export const deleteStaff = async (id: number): Promise<void> => {
  await apiClient.delete(`${END_POINT}${id}/`);
};

// --- Vacancies ---
export const getVacancies = async (institutionId: number): Promise<Vacancy[]> => {
  const response = await apiClient.get<Vacancy[]>(VACANCY_ENDPOINT, {
    params: { institution: institutionId, status: 'Open' },
  });
  return response.data;
};
export const createVacancy = async (data: CreateVacancyData) => {
  // We send 'data' as the body of the POST request
  const response = await apiClient.post(VACANCY_ENDPOINT, data);
  return response.data;
};

// Bulk upload and Excel export (unchanged)
export const bulkUploadStaff = async (formData: FormData): Promise<any> => {
  const response = await apiClient.post(`${END_POINT}bulk_upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const exportStaffToExcel = (staffList: Staff[], filename: string = "Staff_List.xlsx") => {
  if (!staffList || staffList.length === 0) return;

  const XLSX = require("xlsx");
  const excelData = staffList.map((staff) => ({
    "Employee ID": staff.employee_id,
    "First Name": staff.first_name,
    "Last Name": staff.last_name,
    "Email": staff.email,
    "Phone": staff.phone,
    "Position": staff.position,
    "Faculty": staff.faculty_name || "N/A",
    "Department": staff.department_name || "N/A",
    "Qualification": staff.qualification,
    "Specialization": staff.specialization,
    "Status": staff.is_active ? "Active" : "Inactive",
    "Date Joined": staff.date_joined,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Directory");
  XLSX.writeFile(workbook, filename);
};

export default {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getVacancies,
  bulkUploadStaff,
  exportStaffToExcel,
};