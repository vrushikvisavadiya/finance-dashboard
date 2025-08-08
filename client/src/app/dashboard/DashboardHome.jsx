// Updated DashboardHome.jsx
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardGreeting from "@/sections/Dashboard/DashboardGreeting";
import DashboardStats from "@/sections/Dashboard/DashboardStats";
import MonthlyTrendChart from "@/sections/Dashboard/MonthlyTrendChart";
import ExpenseByCategoryChart from "@/sections/Dashboard/ExpenseByCategoryChart";
import RecentTransactions from "@/sections/Dashboard/RecentTransactions";
import BudgetOverview from "@/sections/Dashboard/BudgetOverview";
import QuickActions from "@/sections/Dashboard/QuickActions";
import FinancialInsights from "@/sections/Dashboard/FinancialInsights";

export default function DashboardHome() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return [
            "overview",
            "monthly-trend",
            "expense-by-category",
            "recent-transactions",
            "budget-overview",
            "current-month-insights",
            "category-insights",
            "top-category",
            "user-profile", // Also refresh user data
          ].includes(key);
        },
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 pb-8">
        {/* Greeting Component */}
        <DashboardGreeting
          onRefresh={handleRefreshAll}
          isRefreshing={isRefreshing}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Financial Overview</h2>
            <DashboardStats />
          </section>

          {/* Quick Actions */}
          {/* <section>
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <QuickActions />
          </section> */}

          {/* Budget Status */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Budget Status</h2>
            <BudgetOverview />
          </section>

          {/* Charts Section - 8/4 Layout */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Trends & Analysis</h2>
            <div className="space-y-6">
              {/* Monthly Trend - Full width */}
              <MonthlyTrendChart />

              {/* Charts in 8/4 layout */}
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <RecentTransactions />
                </div>
                <div className="lg:col-span-4">
                  <ExpenseByCategoryChart />
                </div>
              </div>
            </div>
          </section>

          {/* Financial Insights */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Financial Insights</h2>
            <FinancialInsights />
          </section>
        </div>
      </div>
    </div>
  );
}
