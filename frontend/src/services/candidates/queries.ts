import { useQuery } from "@tanstack/react-query";
import { getAllCandidates, getCandidateById } from "./api";

export const useGetAllCandidates = (search?: string, positionId?: string) => {
  return useQuery({
    queryKey: ["candidates", { search, positionId }],
    queryFn: () => getAllCandidates(search, positionId),
  });
};

export const useGetCandidateById = (id: string) => {
  return useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidateById(id),
    enabled: !!id,
  });
};
