// sections/Dashboard/ExpenseByCategoryChart.jsx - Updated with better spacing
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COLORS = [
  "#4f46e5",
  "#f97316",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#eab308",
  "#ec4899",
  "#6366f1",
  "#84cc16",
];

const getBreakdown = () =>
  api.get("/analytics/expenses-by-category").then((r) => {
    const data = r.data.data.categoryBreakdown || [];
    return Array.isArray(data) ? data : [];
  });

export default function ExpenseByCategoryChart() {
  const query = useQuery({
    queryKey: ["expense-by-category"],
    queryFn: getBreakdown,
  });

  return (
    <QueryLoader query={query}>
      {(data) => {
        const chartData = Array.isArray(data) ? data.slice(0, 6) : []; // Limit to top 6 categories

        if (chartData.length === 0) {
          return (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-muted-foreground text-sm">
                    No expense data available
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chart Section */}
              <div className="h-48 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="totalSpent"
                      nameKey="categoryName"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `₹${value.toLocaleString()}`,
                        "Amount",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Section */}
              <div className="px-4 pb-4 space-y-2 border-t">
                {chartData.map((item, index) => (
                  <div
                    key={item.categoryId}
                    className="flex items-center justify-between text-sm mt-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="truncate">{item.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ₹{item.totalSpent.toLocaleString()}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {item.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      }}
    </QueryLoader>
  );
}
