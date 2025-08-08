// sections/Dashboard/BudgetOverview.jsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TargetIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const getBudgetOverview = () =>
  api.get("/budgets/overview?period=monthly").then((res) => res.data.data);

export default function BudgetOverview() {
  const query = useQuery({
    queryKey: ["budget-overview"],
    queryFn: getBudgetOverview,
  });

  return (
    <QueryLoader query={query}>
      {(overview) => (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5" />
              Budget Progress
            </CardTitle>
            {overview.alertCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangleIcon className="h-3 w-3" />
                {overview.alertCount} alerts
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Total Spent</span>
              <span className="font-medium">
                ₹{overview.totalSpent?.toLocaleString()} / ₹
                {overview.totalBudget?.toLocaleString()}
              </span>
            </div>
            <Progress
              value={Math.min(
                (overview.totalSpent / overview.totalBudget) * 100,
                100
              )}
              className="h-2"
              indicatorClassName={cn(
                overview.overallPercentage > 100
                  ? "bg-red-500"
                  : overview.overallPercentage > 80
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{overview.overallPercentage?.toFixed(1)}% used</span>
              <span>
                ₹
                {(overview.totalBudget - overview.totalSpent)?.toLocaleString()}{" "}
                remaining
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </QueryLoader>
  );
}
