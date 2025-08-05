import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { QueryLoader } from "@/components/QueryLoader";
import StatsCard from "@/components/cards/StatsCard";

import { TrendingUpIcon, TrendingDownIcon, Wallet2Icon } from "lucide-react";

const getOverview = () =>
  api.get("/analytics/overview").then((res) => res.data.data);

export default function DashboardStats() {
  const overviewQuery = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
    refetchOnWindowFocus: false,
  });

  return (
    <QueryLoader query={overviewQuery}>
      {(overview) => {
        const { income, expense, balance } = overview.summary;

        const cards = [
          {
            label: "Income",
            value: income,
            icon: <TrendingUpIcon />,
            accent: "emerald",
            secondary:
              overview.delta?.income &&
              `${overview.delta.income}% from last month`,
          },
          {
            label: "Expenses",
            value: expense,
            icon: <TrendingDownIcon />,
            accent: "red",
            secondary:
              overview.delta?.expense &&
              `${overview.delta.expense}% from last month`,
          },
          {
            label: "Balance",
            value: balance,
            icon: <Wallet2Icon />,
            accent: "blue",
          },
        ];

        return (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <StatsCard
                key={c.label}
                label={c.label}
                value={c.value}
                icon={c.icon}
                accent={c.accent}
                secondary={c.secondary}
              />
            ))}
          </div>
        );
      }}
    </QueryLoader>
  );
}
