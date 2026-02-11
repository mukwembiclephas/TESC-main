// src/services/analysis.services.ts
import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { DashboardStats, StudentDistribution, EnrollmentTrendItem, InstitutionOverviewItem,StudentTeacherRatioItem } from "@/lib/types/dashboard.types";


export interface DropoutStats {
  total_dropouts: number;
  chart_data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const analysisService = {
  getAnalysisStats: async (): Promise<DashboardStats> => {
    const response: AxiosResponse<DashboardStats> = await apiClient.get("analysis/dashboard/");
    return response.data;
  },
  getStudentDistribution: async (): Promise<StudentDistribution> => {
    const response: AxiosResponse<StudentDistribution> = await apiClient.get("analysis/student-distribution/");
    return response.data;},
  getEnrollmentTrends: async (): Promise<EnrollmentTrendItem[]> => {
    const response: AxiosResponse<EnrollmentTrendItem[]> = await apiClient.get(
      "/academic/dashboard/enrollment-trends/"
    );
    return response.data;
  },

  getInstitutionOverview: async (): Promise<InstitutionOverviewItem[]> => {
    const response: AxiosResponse<InstitutionOverviewItem[]> = await apiClient.get(
      "/academic/dashboard/institutions/"
    );
    return response.data;
  },
  getStudentTeacherRatio: async (): Promise<StudentTeacherRatioItem []> => {
    const response: AxiosResponse<StudentTeacherRatioItem[]> = await apiClient.get(
      "/analysis/student-teacher-ratio/"
    );
    return response.data;
  },
   };
// services/analysis.services.ts



const END_POINT = '/analysis/';

// Updated: No arguments required
export const getDropoutAnalysis = async () => {
  const response = await apiClient.get<DropoutStats>(`/academic/students/dropout-stats/`);
  return response.data;
};
// services/analysis.services.ts

export interface FinancialStats {
  stats: {
    totalPending: number;
    complianceRate: number;
    studentsWithPending: number;
    totalCollectedYTD: number;
  };
  fee_structure: Array<{ name: string; annual_fee: number }>;
  payment_data: Array<{ month: string; Collected: number; Target: number }>;
  top_pending: any[];
}

export const getFinancialStats = async () => {
  const response = await apiClient.get<FinancialStats>(`academic/payments/finance/`);
  return response.data;
};

export interface RegionalStats {
  stats: {
    provinces_covered: number;
    top_enrollment: string;
    total_enrollment: number;
    total_institutions: number;
  };
  chart_data: Array<{
    province: string;
    institutions: number;
    students: number;
    hubs: number;
  }>;
}

export const getRegionalStats = async () => {
  const response = await apiClient.get<RegionalStats>(`${END_POINT}regional-stats/`);
  return response.data;
};

export const getHubStats = async () => {
  const res = await apiClient.get(`${END_POINT}hubs/`);
  return res.data;
};

export const getStartupStats = async () => {
  const res = await apiClient.get(`${END_POINT}startups/`);
  return res.data;
};

export const getIndustrialStats = async () => {
  const res = await apiClient.get(`${END_POINT}industrial/`);
  return res.data;
};

export const getInnovationOverview = async () => {
  const res = await apiClient.get(`${END_POINT}innovation-overview/`);
  return res.data;
};

// services/analysis.services.ts

export const getAdmissionStats = async () => {
  const res = await apiClient.get(`${END_POINT}admissions-stats/`);
  return res.data;
};

export interface SpecialStats {
  special_students: { disability_type: string; value: number }[];
  work_for_fees: { work_area: string; students: number; hours: number }[];
  counts: {
    iseop: number;
    work_for_fees: number;
    disabled: number;
  };
}

export const getSpecialEnrollmentStats = async (): Promise<SpecialStats> => {
  // Call the endpoint without institution_id params
  const response = await apiClient.get<SpecialStats>(`/academic/students/special-stats/`);
  return response.data;
};
