// sections/Dashboard/QuickActions.jsx - Improved UI
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TargetIcon, FileTextIcon, PieChartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import TransactionDialog from "../Transactions/TransactionDialog";
import BudgetDialog from "../BudgetProgress/BudgetDialog";
// import TransactionDialog from "@/components/TransactionDialog";
// import BudgetDialog from "@/components/BudgetDialog";

export default function QuickActions() {
  const actions = [
    {
      label: "Add Transaction",
      icon: <PlusIcon className="h-5 w-5" />,
      component: TransactionDialog,
      props: {},
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Create Budget",
      icon: <TargetIcon className="h-5 w-5" />,
      component: BudgetDialog,
      props: {},
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      label: "View Transactions",
      icon: <FileTextIcon className="h-5 w-5" />,
      to: "/transactions",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Manage Budgets",
      icon: <PieChartIcon className="h-5 w-5" />,
      to: "/budgets",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            if (action.component) {
              const DialogComponent = action.component;
              return (
                <DialogComponent
                  key={action.label}
                  trigger={
                    <Button
                      className={`h-16 flex-col gap-2 text-white ${action.color} border-0`}
                      variant="outline"
                    >
                      {action.icon}
                      <span className="text-xs font-medium">
                        {action.label}
                      </span>
                    </Button>
                  }
                />
              );
            }

            return (
              <Button
                key={action.label}
                asChild
                className={`h-16 flex-col gap-2 text-white ${action.color} border-0`}
                variant="outline"
              >
                <Link to={action.to}>
                  {action.icon}
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
