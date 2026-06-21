import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/components";

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[420px] w-full max-w-md rounded-xl" />}>
      <LoginForm
        redirectTo="/dashboard"
        title="Bem-vindo"
        description="Acesse o painel da sua clínica."
      />
    </Suspense>
  );
}
