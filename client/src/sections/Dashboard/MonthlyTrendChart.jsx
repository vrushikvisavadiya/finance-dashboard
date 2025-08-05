import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const getTrend = () =>
  api.get("/analytics/monthly-trend").then((r) => {
    const data = r.data.data?.monthlyTrend || [];
    return Array.isArray(data) ? data : [];
  });

export default function MonthlyTrendChart() {
  const query = useQuery({ queryKey: ["monthly-trend"], queryFn: getTrend });

  return (
    <QueryLoader query={query}>
      {(data) => {
        // Double-check the data is an array
        const chartData = Array.isArray(data) ? data : [];

        if (chartData.length === 0) {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No trend data available</p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>

            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20 }}>
                  {/* rest of your chart config */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(v) => format(new Date(v), "MMM")}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    formatter={(v) =>
                      new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(v)
                    }
                    labelFormatter={(l) => format(new Date(l), "MMMM yyyy")}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      }}
    </QueryLoader>
  );
}
