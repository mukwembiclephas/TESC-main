import apiClient from "./api";
import type { AxiosResponse } from "axios";
import type { DashboardInnovationStats, DetailedInnovation } from "@/lib/types/academic.types";

export const InnovationAnalyticsService = {
  getInnovationStats: async (): Promise<DashboardInnovationStats> => {
    const response: AxiosResponse<DashboardInnovationStats> = await apiClient.get(
      "/innovation/dashboard/stats/"
    );
    return response.data;
  },

  getDetailedInnovations: async (): Promise<DetailedInnovation[]> => {
    const response: AxiosResponse<DetailedInnovation[]> = await apiClient.get(
      "/innovation/dashboard/projects/"
    );
    return response.data;
  },
};
