import * as Sheet from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { formatISO } from "date-fns";
import { useCategories } from "@/hooks/useCategories";

const schema = z.object({
  amount: z.number().positive(),
  date: z.string(),
  categoryId: z.string(),
  note: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["income", "expense"]),
});

export default function TransactionForm({ open, onOpenChange, initial }) {
  const { data: categories = [] } = useCategories();
  console.log("categories: ", categories);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          ...initial,
          categoryId: initial.category._id,
          date: initial.date.slice(0, 10),
        }
      : {
          amount: "",
          date: "",
          categoryId: "",
          note: "",
          description: "",
          type: "expense",
        },
  });
  console.log("watch: ", watch());

  const onSubmit = async (values) => {
    console.log("values: ", values);
    const body = {
      ...values,
      amount: Number(values.amount),
      date: formatISO(new Date(values.date)),
    };
    if (initial) await updateMutation.mutateAsync({ id: initial._id, ...body });
    else await createMutation.mutateAsync(body);
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Portal>
        <Sheet.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Sheet.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background p-6 shadow-lg">
          <Sheet.Title className="text-lg font-semibold mb-4">
            {initial ? "Edit Transaction" : "New Transaction"}
          </Sheet.Title>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">Amount required</p>
              )}
            </div>

            <div>
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>

            <div>
              <Label>Category</Label>
              <Select {...register("categoryId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Type</Label>
                <Select {...register("type")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Note</Label>
                <Input {...register("note")} />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input {...register("description")} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {initial ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.Portal>
    </Sheet.Root>
  );
}
