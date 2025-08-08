// sections/Dashboard/DashboardGreeting.jsx - Enhanced version
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCwIcon, UserIcon } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { format } from "date-fns";

export default function DashboardGreeting({ onRefresh, isRefreshing }) {
  const userQuery = useUser();

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserName = () => {
    if (userQuery.data) {
      return (
        userQuery.data.user?.fullName || userQuery.data.fullName || "there"
      );
    }
    return "there";
  };

  const getTimeBasedEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    if (hour < 17) return "☀️";
    return "🌙";
  };

  const getCurrentDate = () => {
    return format(new Date(), "EEEE, MMMM do, yyyy");
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 -mx-6 px-6 py-8 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* User Avatar/Icon */}
          <div className="w-12 h-12 bg-white/20 dark:bg-gray-800/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {getGreeting()}, {getUserName()}! {getTimeBasedEmoji()}
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">{getCurrentDate()}</p>
              {userQuery.data?.user?.email && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-foreground"
                >
                  {userQuery.data.user.email}
                </Badge>
              )}
            </div>

            {/* Loading state */}
            {userQuery.isLoading && (
              <p className="text-xs text-muted-foreground mt-1 animate-pulse">
                Loading your profile...
              </p>
            )}
          </div>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20"
        >
          <RefreshCwIcon
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
