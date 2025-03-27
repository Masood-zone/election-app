import { useMutation, useQuery } from "@tanstack/react-query";
import { getAdmin, getVoter, loginAdmin, loginUser } from "./api";
import { toast } from "react-toastify";
import { ErrorToast, SuccessToast } from "@/components/toasts/toasts";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

export const useGetVoter = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  return useQuery({
    queryKey: ["voter"],
    queryFn: getVoter,
    enabled: isAuthenticated && !isAdmin,
  });
};

export const useGetAdmin = () => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  return useQuery({
    queryKey: ["admin"],
    queryFn: getAdmin,
    enabled: isAuthenticated && isAdmin,
  });
};

export const useLoginVoter = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: async (data: VoterLoginRequest) => {
      const response = await loginUser(data);
      return response;
    },
    onSuccess: (data) => {
      const { status } = data;
      login(data);
      toast(SuccessToast, {
        data: {
          message: `Login successful ${status}`,
        },
      });
      navigate("/");
    },
    onError: (error: AxiosError) => {
      const statusCode = error?.response?.status;
      // Handle 400 validation errors
      if (statusCode === 400) {
        const { errors } = (error?.response?.data as {
          errors: { msg: string; path: string }[];
        }) ?? { errors: [] };
        errors?.forEach((err: { msg: string; path: string }) => {
          toast.error(ErrorToast, {
            data: {
              message: err.msg,
              errors: [{ msg: err.msg, path: err.path }],
            },
          });
        });
      } else {
        // Handle other errors
        const { message } = (error?.response?.data as { message?: string }) || {
          message: "An unknown error occurred",
        };
        toast.error(ErrorToast, {
          data: {
            message: message,
            status: statusCode,
          },
        });
      }
    },
  });
};

export const useLoginAdmin = (redirect: string) => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: async (data: AdminLoginRequest) => {
      const response = await loginAdmin(data);
      return response;
    },
    onSuccess: (data) => {
      const { status } = data;
      login(data);
      toast(SuccessToast, {
        data: {
          message: `Login successful ${status}`,
        },
      });
      if (redirect === "") {
        navigate("/admin/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    },
    onError: (error: AxiosError) => {
      const statusCode = error?.response?.status;
      // Handle 400 validation errors
      if (statusCode === 400) {
        const { errors } = (error?.response?.data as {
          errors: { msg: string; path: string }[];
        }) ?? { errors: [] };
        errors?.forEach((err: { msg: string; path: string }) => {
          toast.error(ErrorToast, {
            data: {
              message: err.msg,
              errors: [{ msg: err.msg, path: err.path }],
            },
          });
        });
      } else {
        // Handle other errors
        const { message } = (error?.response?.data as { message?: string }) || {
          message: "An unknown error occurred",
        };
        toast.error(ErrorToast, {
          data: {
            message: message,
            status: statusCode,
          },
        });
      }
    },
  });
};
