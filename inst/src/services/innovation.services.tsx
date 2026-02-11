import apiClient from "./api";

// --- Types ---

// Enums based on your Django Choices
export type Sector = 'agritech' | 'edtech' | 'healthtech' | 'fintech' | 'mining' | 'energy' | 'manufacturing' | 'other';
export type ProjectStage = 'ideation' | 'prototype' | 'incubation' | 'market_ready' | 'scaling' | 'industrial';
export type HubStatus = 'High' | 'Medium' | 'Full';

// 1. Innovation Hub Interface
export interface InnovationHub {
  id: number;
  institution: number;
  name: string;
  capacity: number;
  occupied: number;
  services: number;
  status: HubStatus;
}

// 2. Project Interface (The master model)
export interface Project {
  id: number;
  institution: number;
  hub?: number | null; // Optional link to a hub
  name: string;
  team_name: string;
  sector: Sector;
  location_category: 'Urban' | 'Rural';
  stage: ProjectStage;
  stage_display?: string; // Read-only from backend
  problem_statement: string;
  proposed_solution: string;
  revenue_generated: number;
  funding_acquired: number;
  jobs_created: number;
  created_at?: string;
}

// 3. Partnership Interface
export interface Partnership {
  id: number;
  institution: number;
  partner_name: string;
  focus_area: string;
  agreement_date: string; // ISO Date string
  status: string;
}

// 4. Research Grant Interface
export interface ResearchGrant {
  id: number;
  institution: number;
  project: number; // ID of the linked project
  project_name?: string; // Optional read-only for display
  donor: string;
  amount: number;
  date_awarded: string;
}

// --- API Endpoints ---
const ENDPOINTS = {
  PROJECTS: '/innovation/projects/',
  HUBS: '/innovation/hubs/',
  PARTNERSHIPS: '/innovation/partnerships/',
  GRANTS: '/innovation/grants/',
};

// --- Service Functions ---

// 1. PROJECTS
export const getProjects = async (params?: { institution_id?: number; search?: string }) => {
  const response = await apiClient.get<Project[]>(ENDPOINTS.PROJECTS, { params });
  
  return response.data;
};

export const createProject = async (data: Partial<Project>) => {
  const response = await apiClient.post<Project>(ENDPOINTS.PROJECTS, data);
  return response.data;
};

export const updateProject = async (id: number, data: Partial<Project>) => {
  const response = await apiClient.patch<Project>(`${ENDPOINTS.PROJECTS}${id}/`, data);
  return response.data;
};

export const deleteProject = async (id: number) => {
  await apiClient.delete(`${ENDPOINTS.PROJECTS}${id}/`);
};

// 2. HUBS
export const getHubs = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<InnovationHub[]>(ENDPOINTS.HUBS, { params });
  return response.data;
};

export const createHub = async (data: Partial<InnovationHub>) => {
  const response = await apiClient.post<InnovationHub>(ENDPOINTS.HUBS, data);
  return response.data;
};

// 3. PARTNERSHIPS
export const getPartnerships = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<Partnership[]>(ENDPOINTS.PARTNERSHIPS, { params });
  return response.data;
};

export const createPartnership = async (data: Partial<Partnership>) => {
  const response = await apiClient.post<Partnership>(ENDPOINTS.PARTNERSHIPS, data);
  return response.data;
};

// 4. GRANTS
export const getGrants = async (params?: { institution_id?: number }) => {
  const response = await apiClient.get<ResearchGrant[]>(ENDPOINTS.GRANTS, { params });
  return response.data;
};

export const createGrant = async (data: Partial<ResearchGrant>) => {
  const response = await apiClient.post<ResearchGrant>(ENDPOINTS.GRANTS, data);
  return response.data;
};

export const updateHub = async (id: number, data: Partial<InnovationHub>) => {
  const response = await apiClient.patch<InnovationHub>(`/innovation/hubs/${id}/`, data);
  return response.data;
};

export const updatePartnership = async (id: number, data: Partial<Partnership>) => {
  const response = await apiClient.patch<Partnership>(`/innovation/partnerships/${id}/`, data);
  return response.data;
};

export const updateGrant = async (id: number, data: Partial<ResearchGrant>) => {
  const response = await apiClient.patch<ResearchGrant>(`/innovation/grants/${id}/`, data);
  return response.data;
};

const innovationService = {
  getProjects, createProject, updateProject, deleteProject,
  getHubs, createHub,
  getPartnerships, createPartnership,
  getGrants, createGrant
};

export default innovationService;