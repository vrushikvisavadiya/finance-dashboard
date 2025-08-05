import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/* helpers to unwrap nested payloads */
const pick = (res, prop) => res.data?.data?.[prop] ?? [];

export const useTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: () =>
      api.get("/transactions?limit=100").then((r) => pick(r, "transactions")),
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      api.post("/transactions", body).then((r) => r.data.data.transaction),
    onSuccess: () => qc.invalidateQueries(["transactions"]),
  });
};

export const useUpdateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/transactions/${id}`, body),
    onSuccess: () => qc.invalidateQueries(["transactions"]),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries(["transactions"]),
  });
};
