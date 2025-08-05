import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useResendOtp } from "@/hooks/useAuth";

export default function ResendOtpButton({ email }) {
  const resendMutation = useResendOtp();
  const [cooldown, setCooldown] = useState(0);

  const handleClick = async () => {
    if (cooldown) return;
    await resendMutation.mutateAsync({ email });
    setCooldown(30);
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) clearInterval(id);
        return c - 1;
      });
    }, 1_000);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={cooldown || resendMutation.isPending}
    >
      {cooldown ? `Resend in ${cooldown}s` : "Resend OTP"}
    </Button>
  );
}
