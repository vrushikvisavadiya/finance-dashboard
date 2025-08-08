// components/BudgetDialog.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCategories } from "@/hooks/useCategories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/useBudgets";

const schema = z
  .object({
    budgetType: z.enum(["category", "overall"]),
    categoryId: z.string().optional(),
    name: z.string().optional(),
    amount: z.number().min(1, "Amount must be greater than 0"),
    period: z.enum(["weekly", "monthly", "yearly"]),
    alertThreshold: z.number().min(0).max(100),
  })
  .refine(
    (data) => {
      if (data.budgetType === "category" && !data.categoryId) {
        return false;
      }
      if (data.budgetType === "overall" && !data.name) {
        return false;
      }
      return true;
    },
    {
      message:
        "Category is required for category budgets, name is required for overall budgets",
      path: ["categoryId"],
    }
  );

export default function BudgetDialog({
  trigger,
  initial = null,
  open,
  onOpenChange,
}) {
  const isEdit = !!initial;
  const categoriesQuery = useCategories();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          budgetType: initial.categoryId ? "category" : "overall",
          categoryId: initial.categoryId?._id || "",
          name: initial.name || "",
          amount: initial.amount || 0,
          period: initial.period || "monthly",
          alertThreshold: initial.alertThreshold || 80,
        }
      : {
          budgetType: "category",
          categoryId: "",
          name: "",
          amount: 0,
          period: "monthly",
          alertThreshold: 80,
        },
  });

  const budgetType = watch("budgetType");

  const onSubmit = async (data) => {
    try {
      const submitData = {
        amount: data.amount,
        period: data.period,
        alertThreshold: data.alertThreshold,
      };

      if (data.budgetType === "category") {
        submitData.categoryId = data.categoryId;
      } else {
        submitData.name = data.name;
        submitData.budgetType = "overall";
      }

      if (isEdit) {
        await updateMutation.mutateAsync({ id: initial._id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }

      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Budget operation failed:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Budget" : "Create Budget"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Budget Type */}
          <div className="space-y-2 w-full">
            <Label>Budget Type</Label>
            <Select
              value={budgetType}
              className="w-full"
              onValueChange={(value) => setValue("budgetType", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category Budget</SelectItem>
                <SelectItem value="overall">Overall Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Selection (only if category budget) */}
          {budgetType === "category" && (
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(value) => setValue("categoryId", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesQuery.data
                    ?.filter((cat) => cat.type === "expense")
                    .map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          )}

          {/* Budget Name (only if overall budget) */}
          {budgetType === "overall" && (
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Spending Limit"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label>Period</Label>
            <Select
              value={watch("period")}
              onValueChange={(value) => setValue("period", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-2">
            <Label htmlFor="alertThreshold">
              Alert Threshold ({watch("alertThreshold")}%)
            </Label>
            <Input
              id="alertThreshold"
              type="range"
              min="50"
              max="100"
              step="5"
              {...register("alertThreshold", { valueAsNumber: true })}
              className="bg-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Budget"
                : "Create Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
