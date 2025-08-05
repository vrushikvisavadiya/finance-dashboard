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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  IndianRupeeIcon,
  CalendarIcon,
  TagsIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  StickyNoteIcon,
  FileTextIcon,
} from "lucide-react";

import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date(),
  categoryId: z.string().min(1, "Please select a category"),
  note: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["income", "expense"]),
});

/* ------------------------------------------------------------------ */
/*  TransactionDialog
/* ------------------------------------------------------------------ */
export default function TransactionDialog({
  trigger,
  initial,
  open: controlledOpen,
  onOpenChange: controlledSetOpen,
}) {
  /* ------------ state for uncontrolled mode ------------ */
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledSetOpen ?? setInternalOpen;

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  /* ------------ RTK query hooks ------------ */
  const { data: categories = [] } = useCategories();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  /* ------------ form ------------ */
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          amount: initial.amount,
          date: new Date(initial.date),
          categoryId: initial.category._id,
          note: initial.note ?? "",
          description: initial.description ?? "",
          type: initial.type,
        }
      : {
          amount: "",
          date: new Date(),
          categoryId: "",
          note: "",
          description: "",
          type: "expense",
        },
  });

  const selectedType = watch("type");

  /* ------------ keep category & type in sync ------------ */
  useEffect(() => {
    const current = getValues("categoryId");
    if (!current) return;
    const cat = categories.find((c) => c._id === current);
    if (!cat || cat.type !== selectedType) {
      setValue("categoryId", "");
    }
  }, [selectedType, categories, getValues, setValue]);

  /* ------------ submit ------------ */
  const onSubmit = async (values) => {
    const body = { ...values, date: values.date.toISOString() };
    if (initial) await updateTx.mutateAsync({ id: initial._id, ...body });
    else await createTx.mutateAsync(body);

    reset();
    setOpen(false);
  };

  /* ------------ filtered categories ------------ */
  const filteredCategories = categories.filter((c) => c.type === selectedType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {initial ? "Edit Transaction" : "Add New Transaction"}
          </DialogTitle>
        </DialogHeader>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* 1. TYPE (tab-style buttons) */}
          <div>
            <Label className="mb-3 block">Transaction Type</Label>
            <Controller
              name="type"
              control={control}
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
                    <TrendingUpIcon className="h-4 w-4" /> Income
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
                    <TrendingDownIcon className="h-4 w-4" /> Expense
                  </Button>
                </div>
              )}
            />
          </div>

          {/* 2. AMOUNT */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <IndianRupeeIcon className="h-4 w-4" /> Amount
            </Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
              className="text-lg"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* 3. DATE (popover calendar) */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-4 w-4" /> Date
            </Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal"
                    >
                      {field.value ? format(field.value, "PPP") : "Select date"}
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>

          {/* 4. CATEGORY (filtered) */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <TagsIcon className="h-4 w-4" /> Category
            </Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full",
                              c.type === "income"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            )}
                          />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* 5. NOTE */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <StickyNoteIcon className="h-4 w-4" /> Note
            </Label>
            <Input placeholder="Quick note…" {...register("note")} />
          </div>

          {/* 6. DESCRIPTION */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <FileTextIcon className="h-4 w-4" /> Description
            </Label>
            <Input
              placeholder="Detailed description…"
              {...register("description")}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={createTx.isPending || updateTx.isPending}
              className={cn(
                selectedType === "income"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              )}
            >
              {createTx.isPending || updateTx.isPending
                ? "Saving…"
                : initial
                ? "Update Transaction"
                : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
