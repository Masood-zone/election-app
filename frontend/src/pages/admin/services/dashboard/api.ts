import { api } from "@/services/api";

export const getDashboardData = async (): Promise<DashboardDataResponse> => {
  const response = await api.get<DashboardDataResponse>("/admin/dashboard");
  return response.data;
};

export const getHistoricalAnalytics = async () => {
  const response = await api.get("/admin/analytics/historical");
  return response.data;
};
