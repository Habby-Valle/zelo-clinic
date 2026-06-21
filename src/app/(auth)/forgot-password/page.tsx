import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ForgotPasswordForm } from "@/features/auth/components";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[360px] w-full max-w-md rounded-xl" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
