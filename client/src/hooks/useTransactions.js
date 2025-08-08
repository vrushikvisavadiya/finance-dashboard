import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/* helpers to unwrap nested payloads */
// const pick = (res, prop) => res.data?.data?.[prop] ?? [];

export function useTransactions(params = {}) {
  // Remove empty params to keep URL clean
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null)
  );

  return useQuery({
    queryKey: ["transactions", cleanParams],
    queryFn: async () => {
      const response = await api.get("/transactions", { params: cleanParams });
      return {
        list: response.data.data.transactions,
        pagination: response.data.data.pagination,
        filters: response.data.data.filters,
      };
    },
  });
}
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
