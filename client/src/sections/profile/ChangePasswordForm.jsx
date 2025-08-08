// components/profile/ChangePasswordForm.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LockIcon } from "lucide-react";
import { api } from "@/lib/api";

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();
  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.put("/users/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setSuccess("Password changed successfully!");
      reset();
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockIcon className="h-5 w-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              {...register("currentPassword", {
                required: "Current password is required",
              })}
              className="mt-2"
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
              })}
              className="mt-2"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              {...register("confirmNewPassword", {
                required: "Please confirm your new password",
                validate: (v) => v === newPassword || "Passwords do not match",
              })}
              className="mt-2"
            />
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setError("");
                setSuccess("");
              }}
              disabled={loading}
              className="flex-1"
            >
              Reset Form
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
