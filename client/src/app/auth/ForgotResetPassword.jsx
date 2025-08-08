import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { useForgotPassword, useResetPassword } from "@/hooks/useAuth";

export default function ForgotResetPassword() {
  const [isOTPSent, setIsOTPSent] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // React Query mutation instances
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();

  // Request OTP handler
  const requestOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      const data = await forgotPasswordMutation.mutateAsync({ email });
      setMessage(data.message);
      setIsOTPSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send OTP. Please try again."
      );
    }
  };

  // Reset password handler
  const resetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!otp.trim() || !newPassword.trim()) {
      setError("Please enter both OTP and new password.");
      return;
    }

    try {
      const data = await resetPasswordMutation.mutateAsync({
        email,
        otp,
        newPassword,
      });
      setMessage(data.message);
      setIsOTPSent(false);
      setOtp("");
      setNewPassword("");
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reset password. Please try again."
      );
    }
  };

  // Loading state combined for both mutations
  const loading =
    forgotPasswordMutation.isLoading || resetPasswordMutation.isLoading;

  return (
    <div className="max-w-md mx-auto my-16 p-8 border rounded-md shadow-md bg-white dark:bg-gray-800">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            {isOTPSent ? "Reset Password" : "Forgot Password"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert variant="success" className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isOTPSent ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <label
                htmlFor="email"
                className="block font-medium text-gray-700 dark:text-gray-200"
              >
                Enter your e-mail address
              </label>

              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
              />

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <label
                htmlFor="emailReset"
                className="block font-medium text-gray-700 dark:text-gray-200"
              >
                Email Address
              </label>
              <Input
                id="emailReset"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />

              <label
                htmlFor="otp"
                className="block font-medium text-gray-700 dark:text-gray-200"
              >
                OTP
              </label>
              <Input
                id="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                disabled={loading}
                autoComplete="one-time-code"
              />

              <label
                htmlFor="newPassword"
                className="block font-medium text-gray-700 dark:text-gray-200"
              >
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                disabled={loading || !otp.trim() || !newPassword.trim()}
                className="w-full"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>

              <Button
                variant="link"
                onClick={() => {
                  setIsOTPSent(false);
                  setMessage(null);
                  setError(null);
                  setOtp("");
                  setNewPassword("");
                }}
                disabled={loading}
                className="w-full text-center"
              >
                Back to Request OTP
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
