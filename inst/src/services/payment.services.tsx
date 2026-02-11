import apiClient from "./api";

export interface PaymentData {
  student_id: string;
  amount: string | number;
  reference?: string;
  date_paid: string;
}

export const recordStudentPayment = async (data: PaymentData) => {
  const response = await apiClient.post("/academic/payments/record-payment/", data);
  return response.data;
};

const BASE = "/analysis/finance/";

export const getFinancialStats = async () => {
  // Global View: maps to list()
  const response = await apiClient.get(BASE);
  return response.data;
};

export const getInstitutionalFinanceData = async (institutionId: number) => {
  // Institutional View: maps to get_institutional_data()
  const response = await apiClient.get(`${BASE}dashboard-data/`, {
    params: { institution_id: institutionId }
  });
  return response.data;
};

export const updateProgramFee = async (programId: number, fee: number) => {
  // Update Fee: maps to update_program_fees()
  return await apiClient.post(`${BASE}update-program-fees/`, {
    program_id: programId,
    semester_fee: fee
  });
};