// components/profile/ProfileAlert.jsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";

export function SuccessAlert({ message }) {
  if (!message) return null;
  return (
    <Alert className="border-green-200 bg-green-50 text-green-800">
      <CheckCircleIcon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
