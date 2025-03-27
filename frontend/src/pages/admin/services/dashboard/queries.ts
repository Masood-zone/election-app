import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "./api";

export const useGetDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: true,
    retry: true,
  });
};
