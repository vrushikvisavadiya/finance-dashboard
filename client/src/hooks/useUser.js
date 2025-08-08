// hooks/useUser.js - Fixed version
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
// import { toast } from "sonner";

export const useUser = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      return response.data.data || response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });
};

// ✅ Fixed: Change from POST to PATCH
export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.patch("/users/change-password", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};
