import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const pick = (res, prop) => res.data?.data?.[prop] ?? [];

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => pick(r, "categories")),
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      api.post("/categories", body).then((r) => r.data.data.category),
    onSuccess: () => {
      qc.invalidateQueries(["categories"]);
      qc.invalidateQueries(["transactions"]); // refresh transaction forms
    },
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/categories/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries(["categories"]);
      qc.invalidateQueries(["transactions"]);
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(["categories"]);
      qc.invalidateQueries(["transactions"]);
    },
  });
};
