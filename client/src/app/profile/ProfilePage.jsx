import ChangePasswordForm from "@/sections/profile/ChangePasswordForm";
import ProfileHeader from "@/sections/profile/ProfileHeader";
import ProfileInfoCard from "@/sections/profile/ProfileInfoCard";
import SecurityRecommendations from "@/sections/profile/SecurityRecommendations";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInfoCard />
        <ChangePasswordForm />
      </div>
      <SecurityRecommendations />
    </div>
  );
}
