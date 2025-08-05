import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useRegister = () =>
  useMutation({
    mutationFn: (body) => api.post("/auth/register", body).then((r) => r.data),
  });

export const useResendOtp = () =>
  useMutation({
    mutationFn: (body) =>
      api.post("/auth/resend-otp", body).then((r) => r.data),
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (body) =>
      api.post("/auth/verify-otp", body).then((r) => r.data),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (body) => api.post("/auth/login", body).then((r) => r.data),
  });
