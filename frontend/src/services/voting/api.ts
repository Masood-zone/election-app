import { api } from "../api";

export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await api.patch<UpdateProfileResponse>(
    `/voters/update/${data.studentId}`,
    {
      studentName: data.studentName,
      email: data.email,
      telephone: data.telephone,
    }
  );
  return response.data;
};

export const getMyVotes = async () => {
  const response = await api.get("/voting/my-votes");
  return response.data;
};
