// services/institution.service.ts

import apiClient  from './api'; // Use your new api.ts
import { Institution, InstitutionWriteData } from '@/lib/types/academic.types';

const BASE_PATH = '/academic/institutions/';

/**
 * Fetch all institutions
 */
export const getAllInstitutions = async (): Promise<Institution[]> => {
  const response = await apiClient.get<Institution[]>(BASE_PATH);
  
  return response.data;
};

/**
 * Fetch a single institution by its ID
 */
export const getInstitutionById = async (id: number): Promise<Institution> => {
  const response = await apiClient.get<Institution>(`${BASE_PATH}${id}/`);
  return response.data;
};

/**
 * Create a new institution
 */
export const createInstitution = async (
  data: InstitutionWriteData
): Promise<Institution> => {
  const response = await apiClient.post<Institution>(BASE_PATH, data);
  return response.data;
};

/**
 * Update an existing institution
 */
export const updateInstitution = async (
  id: number,
  data: Partial<InstitutionWriteData>
): Promise<Institution> => {
  const response = await apiClient.patch<Institution>(
    `${BASE_PATH}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete an institution
 */
export const deleteInstitution = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_PATH}${id}/`);
};