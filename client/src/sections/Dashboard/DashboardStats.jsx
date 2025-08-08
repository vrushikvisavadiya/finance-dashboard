// sections/Dashboard/DashboardStats.jsx - Updated version
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import StatsCard from "@/components/cards/StatsCard";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  Wallet2Icon,
  TagIcon,
} from "lucide-react";

const getOverview = () =>
  api.get("/analytics/overview").then((res) => res.data.data);

const getTopCategory = () =>
  api.get("/analytics/expenses-by-category").then((res) => {
    const categories = res.data.data.categoryBreakdown;
    return categories.length > 0 ? categories[0] : null;
  });

export default function DashboardStats() {
  const overviewQuery = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
    refetchOnWindowFocus: false,
  });

  const topCategoryQuery = useQuery({
    queryKey: ["top-category"],
    queryFn: getTopCategory,
    refetchOnWindowFocus: false,
  });

  return (
    <QueryLoader query={overviewQuery}>
      {(overview) => {
        const { totalIncome, totalExpense, netBalance } = overview;

        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label="Income"
              value={`₹${totalIncome.toLocaleString()}`}
              icon={<TrendingUpIcon />}
              accent="emerald"
              secondary={
                overview.delta?.income &&
                `${overview.delta.income}% from last month`
              }
            />

            <StatsCard
              label="Expenses"
              value={`₹${totalExpense.toLocaleString()}`}
              icon={<TrendingDownIcon />}
              accent="red"
              secondary={
                overview.delta?.expense &&
                `${overview.delta.expense}% from last month`
              }
            />

            <StatsCard
              label="Balance"
              value={`₹${netBalance.toLocaleString()}`}
              icon={<Wallet2Icon />}
              accent="blue"
            />

            {/* New Top Category Card */}
            <QueryLoader query={topCategoryQuery}>
              {(topCategory) => (
                <StatsCard
                  label="Top Category"
                  value={topCategory ? topCategory.categoryName : "No data"}
                  icon={<TagIcon />}
                  accent="purple"
                  secondary={
                    topCategory
                      ? `₹${topCategory.totalSpent.toLocaleString()} (${
                          topCategory.percentage
                        }%)`
                      : "Add transactions to see data"
                  }
                />
              )}
            </QueryLoader>
          </div>
        );
      }}
    </QueryLoader>
  );
}
