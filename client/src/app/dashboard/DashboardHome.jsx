import DashboardStats from "@/sections/Dashboard/DashboardStats";
import MonthlyTrendChart from "@/sections/Dashboard/MonthlyTrendChart";
import ExpenseByCategoryChart from "@/sections/Dashboard/ExpenseByCategoryChart";
import RecentTransactions from "@/sections/Dashboard/RecentTransactions";

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <DashboardStats />

      <MonthlyTrendChart />

      {/* two-column area: recent tx + category chart */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RecentTransactions />
        <ExpenseByCategoryChart />
      </div>
    </div>
  );
}
