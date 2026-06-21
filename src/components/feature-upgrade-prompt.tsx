import Link from "next/link";
import { Lock, ArrowUpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureUpgradePromptProps {
  featureName: string;
}

export function FeatureUpgradePrompt({ featureName }: FeatureUpgradePromptProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">{featureName} indisponível</h2>
        <p className="max-w-sm text-center text-muted-foreground">
          Seu plano atual não inclui acesso a {featureName.toLowerCase()}. Faça um upgrade para
          liberar este recurso.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <ArrowUpCircle className="h-4 w-4" />
          Ver planos disponíveis
        </Link>
      </CardContent>
    </Card>
  );
}
