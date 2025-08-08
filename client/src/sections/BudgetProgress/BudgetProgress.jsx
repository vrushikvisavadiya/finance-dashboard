// components/BudgetProgress.jsx - Fix the undefined categoryId issue

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TargetIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BudgetProgress({ budget }) {
  const { spending, amount, categoryId, name, budgetType } = budget;
  const { totalSpent, percentage, remaining, isOverBudget, shouldAlert } =
    spending;

  // ✅ Safe access to displayName
  const displayName = categoryId ? categoryId.name : name;
  const budgetTypeLabel = budgetType === "overall" ? "Overall" : "Category";

  const getProgressColor = () => {
    if (isOverBudget) return "bg-red-500";
    if (shouldAlert) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = () => {
    if (isOverBudget) {
      return (
        <Badge variant="destructive" className="gap-1">
          <TrendingUpIcon className="h-3 w-3" />
          Over Budget
        </Badge>
      );
    }
    if (shouldAlert) {
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-yellow-100 text-yellow-800"
        >
          <AlertTriangleIcon className="h-3 w-3" />
          Warning
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
        <TrendingDownIcon className="h-3 w-3" />
        On Track
      </Badge>
    );
  };

  return (
    <Card
      className={cn(
        "transition-all",
        shouldAlert && "border-yellow-300",
        isOverBudget && "border-red-300"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* ✅ Fixed: Check if categoryId exists before accessing its properties */}
            {categoryId ? (
              <span
                className={cn(
                  "w-3 h-3 rounded-full",
                  categoryId.type === "income" ? "bg-emerald-500" : "bg-red-500"
                )}
              />
            ) : (
              <TargetIcon className="w-3 h-3 text-blue-500" />
            )}
            <div>
              <h3 className="font-medium">{displayName}</h3>
              <p className="text-xs text-muted-foreground">
                {budgetTypeLabel} Budget
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ₹{totalSpent.toLocaleString()} / ₹{amount.toLocaleString()}
            </span>
            <span
              className={cn(
                "font-medium",
                isOverBudget ? "text-red-600" : "text-green-600"
              )}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>

          <Progress
            value={Math.min(percentage, 100)}
            className="h-2"
            indicatorClassName={getProgressColor()}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {isOverBudget ? "Exceeded by" : "Remaining"}: ₹
              {Math.abs(remaining).toLocaleString()}
            </span>
            <span>{spending.transactionCount} transactions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
