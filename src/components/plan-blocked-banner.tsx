"use client";

import Link from "next/link";
import { Lock, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePlanBlocked } from "@/features/plan/hooks/use-plan-limits";

export function PlanBlockedBanner() {
  const blocked = usePlanBlocked();
  if (!blocked) return null;

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="h-5 w-5 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Assinatura expirada — modo somente leitura</p>
          <p className="text-sm text-muted-foreground">
            A assinatura da clínica está vencida. Você pode consultar os dados existentes, mas novas
            alterações estão bloqueadas até a renovação do plano.
          </p>
        </div>
        <Link
          href="/plan"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <CreditCard className="h-4 w-4" />
          Ver planos
        </Link>
      </CardContent>
    </Card>
  );
}
