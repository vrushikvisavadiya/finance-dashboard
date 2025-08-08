// sections/Dashboard/CurrentMonthSummary.jsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";

const getCurrentMonth = () =>
  api.get("/analytics/current-month").then((res) => res.data.data);

export default function CurrentMonthSummary() {
  const query = useQuery({
    queryKey: ["current-month-summary"],
    queryFn: getCurrentMonth,
  });

  return (
    <QueryLoader query={query}>
      {(data) => {
        const { currentMonth } = data;

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {currentMonth.month}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{currentMonth.income.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Income ({currentMonth.incomeCount} transactions)
                  </div>
                </div>

                <div>
                  <div className="text-2xl font-bold text-red-600">
                    ₹{currentMonth.expense.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expenses ({currentMonth.expenseCount} transactions)
                  </div>
                </div>

                <div>
                  <div
                    className={`text-2xl font-bold ${
                      currentMonth.balance >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    ₹{currentMonth.balance.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Net Balance
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }}
    </QueryLoader>
  );
}
