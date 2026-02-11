// services/student.service.ts

import apiClient from "./api"; // Use your new api.ts
import { Student, StudentWriteData } from "@/lib/types/academic.types";

const BASE_PATH = "/academic/students/";

/**
 * Fetch all students
 */
export const getAllStudents = async (): Promise<Student[]> => {
  console.log("Fetching all students...");
  const response = await apiClient.get<Student[]>(BASE_PATH);
  console.log(response);
  
  return response.data;
};

/**
 * Fetch a single student by their ID
 */
export const getStudentById = async (id: number): Promise<Student> => {
  const response = await apiClient.get<Student>(`${BASE_PATH}${id}/`);
  return response.data;
};

/**
 * Create a new student
 */
export const createStudent = async (
  data: StudentWriteData
): Promise<Student> => {
  const response = await apiClient.post<Student>(BASE_PATH, data);
  return response.data;
};

/**
 * Update an existing student
 */
export const updateStudent = async (
  id: number,
  data: Partial<StudentWriteData>
): Promise<Student> => {
  const response = await apiClient.patch<Student>(`${BASE_PATH}${id}/`, data);
  return response.data;
};

/**
 * Delete a student
 */
export const deleteStudent = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}${id}/`);
};
