import { api } from "../api";

export const getAdmin = async () => {
  const response = await api.get<AdminAuth>("/admin/profile");
  return response.data;
};

export const getVoter = async () => {
  const response = await api.get<VoterAuth>("/voters/profile");
  return response.data?.voter;
};

export const loginAdmin = async (data: AdminLoginRequest) => {
  const response = await api.post<UserAuth>("/admin/login", {
    studentId: data.email,
    password: data.password,
  });
  return response.data;
};

export const loginUser = async (data: VoterLoginRequest) => {
  const response = await api.post<UserAuth>("/voters/login", {
    studentId: data.studentId,
    password: data.password,
  });
  return response.data;
};

export const registerAdmin = async (data: AdminRegisterRequest) => {
  const response = await api.post<UserAuth>("/admin/register", {
    data,
  });
  return response.data;
};
export const registerUser = async (data: VoterRegisterRequest) => {
  const response = await api.post<UserAuth>("/voters/register", {
    data,
  });
  return response.data;
};
