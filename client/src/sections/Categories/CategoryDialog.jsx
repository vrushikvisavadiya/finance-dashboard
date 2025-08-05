import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagsIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";

import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { useState } from "react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"]),
});

export default function CategoryDialog({
  trigger,
  initial,
  open: controlledOpen,
  onOpenChange: controlledSetOpen,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledSetOpen ?? setInternalOpen;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          type: initial.type,
        }
      : {
          name: "",
          type: "expense",
        },
  });

  const onSubmit = async (values) => {
    if (initial) {
      await updateCategory.mutateAsync({ id: initial._id, ...values });
    } else {
      await createCategory.mutateAsync(values);
    }
    form.reset();
    setOpen(false);
  };

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TagsIcon className="h-5 w-5" />
            {initial ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <form className="mt-6 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {/* TYPE - Button Style */}
          <div>
            <Label className="mb-3 block">Category Type</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={field.value === "income" ? "default" : "outline"}
                    className={cn(
                      "flex-1 gap-2",
                      field.value === "income" &&
                        "bg-emerald-600 hover:bg-emerald-700"
                    )}
                    onClick={() => field.onChange("income")}
                  >
                    <TrendingUpIcon className="h-4 w-4" />
                    Income
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={field.value === "expense" ? "default" : "outline"}
                    className={cn(
                      "flex-1 gap-2",
                      field.value === "expense" && "bg-red-600 hover:bg-red-700"
                    )}
                    onClick={() => field.onChange("expense")}
                  >
                    <TrendingDownIcon className="h-4 w-4" />
                    Expense
                  </Button>
                </div>
              )}
            />
          </div>

          {/* NAME */}
          <div>
            <Label className="mb-2 block">Category Name</Label>
            <Input
              placeholder="Enter category name..."
              {...form.register("name")}
              className="text-lg"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={createCategory.isPending || updateCategory.isPending}
              className={cn(
                selectedType === "income"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {createCategory.isPending || updateCategory.isPending
                ? "Saving..."
                : initial
                ? "Update Category"
                : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
