import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
