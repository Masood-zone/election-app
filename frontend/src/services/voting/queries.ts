import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyVotes, updateProfile } from "./api";
import { toast } from "react-toastify";

export const useGetMyVotes = () => {
  return useQuery({
    queryKey: ["votes"],
    queryFn: getMyVotes,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      // Invalidate and refetch the voter data
      queryClient.invalidateQueries({ queryKey: ["voter"] });
    },
    onError: (error) => {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    },
  });
};
