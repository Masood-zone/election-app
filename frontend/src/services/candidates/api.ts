import { api } from "../api";

export const getAllCandidates = async (
  search?: string,
  positionId?: string
): Promise<CandidatesResponse> => {
  // Build query parameters
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (positionId) params.append("positionId", positionId);

  const queryString = params.toString();
  const endpoint = queryString
    ? `/voting/candidates?${queryString}`
    : "/voting/candidates";

  const response = await api.get<CandidatesResponse>(endpoint);
  return response.data;
};

export const getCandidateById = async (
  id: string
): Promise<CandidateDetailsResponse> => {
  const response = await api.get<CandidateDetailsResponse>(
    `/voting/candidates/${id}`
  );
  return response.data;
};
