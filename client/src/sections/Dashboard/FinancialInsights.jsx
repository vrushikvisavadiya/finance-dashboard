// sections/Dashboard/FinancialInsights.jsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LightbulbIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  PieChartIcon,
} from "lucide-react";

const getCurrentMonthData = () =>
  api.get("/analytics/current-month").then((res) => res.data.data);

const getCategoryBreakdown = () =>
  api.get("/analytics/expenses-by-category").then((res) => res.data.data);

export default function FinancialInsights() {
  const currentMonthQuery = useQuery({
    queryKey: ["current-month-insights"],
    queryFn: getCurrentMonthData,
  });

  const categoryQuery = useQuery({
    queryKey: ["category-insights"],
    queryFn: getCategoryBreakdown,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="h-5 w-5" />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <QueryLoader query={currentMonthQuery}>
          {(monthData) => {
            const { currentMonth } = monthData;
            const savingsRate =
              currentMonth.income > 0
                ? ((currentMonth.balance / currentMonth.income) * 100).toFixed(
                    1
                  )
                : 0;

            return (
              <>
                {/* Spending Alert */}
                {currentMonth.expense > currentMonth.income && (
                  <Alert variant="destructive">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertDescription>
                      You're spending more than you earn this month. Consider
                      reviewing your expenses.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Savings Rate */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Savings rate this month</span>
                  <Badge
                    variant={
                      savingsRate > 20
                        ? "default"
                        : savingsRate > 0
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {savingsRate}%
                  </Badge>
                </div>

                {/* Transaction Activity */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Transactions this month</span>
                  <Badge variant="outline">
                    {currentMonth.totalTransactions} transactions
                  </Badge>
                </div>
              </>
            );
          }}
        </QueryLoader>

        <QueryLoader query={categoryQuery}>
          {(categoryData) => {
            const { categoryBreakdown } = categoryData;
            const topCategory = categoryBreakdown[0]; // First item is highest spent

            return topCategory ? (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Top spending category
                </span>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {topCategory.categoryName}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {topCategory.formattedAmount} ({topCategory.percentage}%)
                  </div>
                </div>
              </div>
            ) : null;
          }}
        </QueryLoader>
      </CardContent>
    </Card>
  );
}
