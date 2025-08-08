// components/profile/ProfileInfoCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, MailIcon, CalendarIcon, EditIcon } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function ProfileInfoCard() {
  const userQuery = useUser();

  const getUserInitials = () => {
    const name =
      userQuery.data?.user?.fullName || userQuery.data?.fullName || "User";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = () =>
    userQuery.data?.user?.fullName || userQuery.data?.fullName || "User";

  const getUserEmail = () =>
    userQuery.data?.user?.email || userQuery.data?.email || "";

  const getJoinDate = () => {
    if (userQuery.data?.user?.createdAt) {
      return new Date(userQuery.data.user.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
    }
    return "Unknown";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-2xl">
            {getUserInitials()}
          </div>
          <div>
            <h3 className="font-semibold text-xl">{getUserName()}</h3>
            <div className="flex items-center gap-2 mt-1">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{getUserEmail()}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                Joined {getJoinDate()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">Active</p>
            <p className="text-sm text-muted-foreground">Account Status</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.floor(
                (new Date() -
                  new Date(userQuery.data?.user?.createdAt || Date.now())) /
                  (1000 * 60 * 60 * 24)
              )}
            </p>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </div>
        </div>

        <Button variant="outline" className="w-full" disabled>
          <EditIcon className="h-4 w-4 mr-2" />
          Edit Profile (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
