// pages/BudgetsPage.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  TargetIcon,
  MoreVerticalIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  FilterIcon,
} from "lucide-react";
import {
  useBudgets,
  useBudgetOverview,
  useDeleteBudget,
} from "@/hooks/useBudgets";
import { QueryLoader } from "@/components/QueryLoader";

import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { cn } from "@/lib/utils";
import BudgetProgress from "@/sections/BudgetProgress/BudgetProgress";
import BudgetDialog from "@/sections/BudgetProgress/BudgetDialog";

export default function BudgetsPage() {
  const [period, setPeriod] = useState("monthly");
  const [filterType, setFilterType] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const budgetsQuery = useBudgets(period);
  const overviewQuery = useBudgetOverview(period);
  const deleteMutation = useDeleteBudget();

  // Filter budgets based on selected filter
  const filteredBudgets =
    budgetsQuery.data?.filter((budget) => {
      if (filterType === "all") return true;
      if (filterType === "category") return budget.budgetType === "category";
      if (filterType === "overall") return budget.budgetType === "overall";
      if (filterType === "overbudget") return budget.spending.isOverBudget;
      if (filterType === "warning")
        return budget.spending.shouldAlert && !budget.spending.isOverBudget;
      if (filterType === "ontrack")
        return !budget.spending.shouldAlert && !budget.spending.isOverBudget;
      return true;
    }) || [];

  const handleEdit = (budget) => {
    setEditBudget(budget);
    setEditOpen(true);
  };

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (budgetToDelete) {
      await deleteMutation.mutateAsync(budgetToDelete._id);
      setDeleteOpen(false);
      setBudgetToDelete(null);
    }
  };

  const handleRefresh = () => {
    budgetsQuery.refetch();
    overviewQuery.refetch();
  };

  return (
    <div className="space-y-6">
      {/* Error Alerts */}
      {deleteMutation.isError && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Delete Failed</AlertTitle>
          <AlertDescription>
            {deleteMutation.error?.response?.data?.message ??
              "Failed to delete budget"}
          </AlertDescription>
        </Alert>
      )}

      {budgetsQuery.isError && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Loading Error</AlertTitle>
          <AlertDescription>
            {budgetsQuery.error?.response?.data?.message ??
              "Failed to load budgets"}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets & Goals</h1>
          <p className="text-muted-foreground">
            Track spending limits and achieve financial goals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={budgetsQuery.isRefetching || overviewQuery.isRefetching}
          >
            <RefreshCwIcon
              className={cn(
                "h-4 w-4",
                (budgetsQuery.isRefetching || overviewQuery.isRefetching) &&
                  "animate-spin"
              )}
            />
          </Button>

          {/* Period Selector */}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Budget Button */}
          <BudgetDialog
            trigger={
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Budget
              </Button>
            }
          />
        </div>
      </div>

      {/* Overview Stats */}
      <QueryLoader query={overviewQuery}>
        {(overview) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TargetIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Budget</span>
                </div>
                <p className="text-2xl font-bold">
                  ₹{overview.totalBudget?.toLocaleString() ?? "0"}
                </p>
                <div className="mt-2">
                  <Progress
                    value={Math.min(
                      (overview.totalSpent / overview.totalBudget) * 100,
                      100
                    )}
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <p className="text-2xl font-bold">
                  ₹{overview.totalSpent?.toLocaleString() ?? "0"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.budgetCount} active budgets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <Badge
                    variant={
                      (overview.overallPercentage ?? 0) > 100
                        ? "destructive"
                        : (overview.overallPercentage ?? 0) > 80
                        ? "secondary"
                        : "default"
                    }
                  >
                    {(overview.overallPercentage ?? 0).toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">
                  ₹{overview.remainingBudget?.toLocaleString() ?? "0"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {overview.remainingBudget >= 0 ? "remaining" : "over budget"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Alerts</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-lg font-bold text-red-600">
                      {overview.overBudgetCount ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Over budget</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">
                      {overview.alertCount ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </QueryLoader>

      {/* Budget List */}
      <QueryLoader query={budgetsQuery}>
        {(budgets) => (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {period.charAt(0).toUpperCase() + period.slice(1)} Budgets (
                {filteredBudgets.length})
              </h2>

              {/* Filter Dropdown */}
              {budgets.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType("all")}>
                      All Budgets ({budgets.length})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterType("category")}>
                      Category Budgets
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("overall")}>
                      Overall Budgets
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterType("ontrack")}>
                      On Track
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("warning")}>
                      Warning
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterType("overbudget")}
                    >
                      Over Budget
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {budgets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <TargetIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No budgets set</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first budget to start tracking spending limits.
                  </p>
                  <BudgetDialog trigger={<Button>Create Budget</Button>} />
                </CardContent>
              </Card>
            ) : filteredBudgets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FilterIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No budgets match filter
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filter criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setFilterType("all")}
                  >
                    Clear Filter
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBudgets.map((budget) => (
                  <div key={budget._id} className="relative group">
                    <BudgetProgress budget={budget} />

                    {/* Action Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(budget)}>
                            <EditIcon className="h-4 w-4 mr-2" />
                            Edit Budget
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(budget)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete Budget
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </QueryLoader>

      {/* Edit Dialog */}
      {editBudget && (
        <BudgetDialog
          initial={editBudget}
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
            if (!open) setEditBudget(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
        title={`Delete "${
          budgetToDelete?.displayName || budgetToDelete?.name
        }" Budget`}
        description={`Are you sure you want to delete this budget? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
