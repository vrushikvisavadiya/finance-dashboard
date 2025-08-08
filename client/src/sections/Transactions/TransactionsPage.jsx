// TransactionsPage.jsx
import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusIcon, CalendarIcon, FilterIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import TransactionTable from "./TransactionTable";
import TransactionDialog from "./TransactionDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TransactionsPage() {
  // Filter and pagination state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: "",
    category: "",
    startDate: "",
    endDate: "",
    search: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  const txQuery = useTransactions(filters);
  const categoriesQuery = useCategories();
  const delMutation = useDeleteTransaction();

  // Dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Date picker states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleEdit = (tx) => {
    setEditTx(tx);
    setEditOpen(true);
  };

  const handleDelete = (tx) => delMutation.mutate(tx._id);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      type: "",
      category: "",
      startDate: "",
      endDate: "",
      search: "",
      sortBy: "date",
      sortOrder: "desc",
    });
    setStartDate(null);
    setEndDate(null);
  };

  const handleStartDateSelect = (date) => {
    setStartDate(date);
    updateFilter("startDate", date ? format(date, "yyyy-MM-dd") : "");
  };

  const handleEndDateSelect = (date) => {
    setEndDate(date);
    updateFilter("endDate", date ? format(date, "yyyy-MM-dd") : "");
  };

  return (
    <div className="space-y-6">
      {delMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Delete failed</AlertTitle>
          <AlertDescription>
            {delMutation.error?.response?.data?.message ?? "Unknown error"}
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Add button and Filter toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expense records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <TransactionDialog
            trigger={
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            }
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search notes, description..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    updateFilter("type", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>{" "}
                    {/* ✅ Changed from "" to "all" */}
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    updateFilter("category", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>{" "}
                    {/* ✅ Changed from "" to "all" */}
                    {categoriesQuery.data?.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Sort */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilter("sortBy", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      updateFilter(
                        "sortOrder",
                        filters.sortOrder === "desc" ? "asc" : "desc"
                      )
                    }
                  >
                    {filters.sortOrder === "desc" ? "↓" : "↑"}
                  </Button>
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table with Pagination */}
      <TransactionTable
        query={txQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        filters={filters}
      />

      {/* Edit Dialog */}
      {editTx && (
        <TransactionDialog
          initial={editTx}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
