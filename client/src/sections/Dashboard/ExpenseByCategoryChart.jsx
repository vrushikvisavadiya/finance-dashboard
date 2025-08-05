import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const COLORS = [
  "#4f46e5",
  "#f97316",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#eab308",
];

const getBreakdown = () =>
  api.get("/analytics/expenses-by-category").then((r) => {
    const data = r.data.data.categoryBreakdown || [];
    console.log("data: ", data);
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
        const chartData = Array.isArray(data) ? data : [];
        console.log("chartData: ", chartData);

        if (chartData.length === 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No category data available
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="totalSpent"
                    nameKey="categoryName"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(v)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      }}
    </QueryLoader>
  );
}
