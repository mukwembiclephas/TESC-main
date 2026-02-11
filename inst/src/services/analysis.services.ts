// src/services/analysis.services.ts
import apiClient from "./api";


const END_POINT = "/analysis/";


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
  const response = await apiClient.get<FinancialStats>(
    `${END_POINT}financial-stats/`
  );
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
  const response = await apiClient.get<RegionalStats>(
    `${END_POINT}regional-stats/`
  );
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
  const response = await apiClient.get<SpecialStats>(
    `/academic/students/special-stats/`
  );
  return response.data;
};

// services/analysis.services.ts

// src/services/analysis.services.ts

export const updateProgramFee = async (programId: number, fee: number) => {
  // We send 'program_id' and 'semester_fee'
  console.log(fee);
  
  return await apiClient.post(`/academic/payments/update-program-fees/`, {
    program_id: Number(programId), // Force cast to Number to ensure it's not null
    semester_fee: fee
  });
};

export const getInstitutionalFinanceData = async (institutionId: number): Promise<FinancialStats> => {
  return await apiClient.get(`/analysis/finance/dashboard-data/`, {
    params: { institution_id: institutionId }
  });
  
};
