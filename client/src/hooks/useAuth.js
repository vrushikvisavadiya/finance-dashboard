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

// Mutation hook to send forgot-password OTP
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data) =>
      api.post("/auth/forgot-password", data).then((res) => res.data),
  });

// Mutation hook to reset password
export const useResetPassword = () =>
  useMutation({
    mutationFn: (data) =>
      api.post("/auth/reset-password", data).then((res) => res.data),
  });
