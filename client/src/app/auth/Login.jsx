import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner"; // Add this import

import { useLogin } from "@/hooks/useAuth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Enter a valid e-mail"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  console.log("errors: ", errors);
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = async (values) => {
    try {
      // Show loading toast
      // const loadingToast = toast.loading("Signing you in...");

      const data = await loginMutation.mutateAsync(values);
      console.log("data: ", data);

      // Store token based on remember preference
      if (values.remember) {
        localStorage.setItem("token", data?.data?.token);
      } else {
        localStorage.setItem("token", data?.data.token);
      }

      // Dismiss loading toast and show success

      toast.success("Welcome back! Login successful.", {
        description: "Redirecting to your dashboard...",
        duration: 2000,
      });

      // Navigate after a brief delay to show the success toast
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      console.log("err: ", err);
      // Show error toast
      const errorMessage = err.response?.data?.message ?? "Invalid credentials";
      toast.error("Login failed", {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-1 bg-background">
      {/* Login form */}
      <div className="flex items-center justify-center px-4">
        <Card className="w-full max-w-md space-y-6 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to manage your finances
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email"
                  type="email"
                  className="pl-9"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Password"
                  type={showPwd ? "text" : "password"}
                  className="pl-9 pr-10"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-1 top-1.5"
                  tabIndex={-1}
                >
                  {showPwd ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox id="remember" {...register("remember")} />
                <label htmlFor="remember" className="text-sm">
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
