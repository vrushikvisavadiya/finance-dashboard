import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { useVerifyOtp } from "@/hooks/useAuth";
import ResendOtpButton from "@/components/auth/ResendOtpButton";
import { Label } from "@/components/ui/label";

const schema = z.object({
  otp: z.string().length(6, "6-digit code"),
});

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;

  const verifyMutation = useVerifyOtp();
  const [serverError, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setError("");
    try {
      await verifyMutation.mutateAsync({ email, otp: values.otp });
      navigate("/login");
    } catch (e) {
      setError(e.response?.data?.message ?? "Invalid OTP");
    }
  };

  //   if (!email)
  //     return <p className="mt-20 text-center text-sm">Missing e-mail context.</p>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md space-y-6 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Code</CardTitle>
          <CardDescription className="text-muted-foreground">
            We’ve sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        {serverError && (
          <Alert variant="destructive" className="mx-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label className="sr-only">OTP</Label>
              <Input
                placeholder="123456"
                maxLength={6}
                className="text-center tracking-widest text-xl font-mono"
                {...register("otp")}
              />
              {errors.otp && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <Button className="w-full" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? "Verifying…" : "Verify"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-center">
            <ResendOtpButton email={email} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
