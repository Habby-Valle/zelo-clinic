"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CreditCard, AlertCircle, Crown, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { requestPlanChange, syncStripeSubscription, cancelSubscription } from "./actions";
import type { Plan, ClinicPlan } from "@/features/plan/types";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSubscribe: (planId: string) => void;
  loadingPlanId: string | null;
  disabled?: boolean;
  disabledReason?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

function PlanCard({
  plan,
  isCurrentPlan,
  onSubscribe,
  loadingPlanId,
  disabled,
  disabledReason,
}: PlanCardProps) {
  const isLoading = loadingPlanId === plan.id;

  return (
    <Card
      className={cn(
        "relative overflow-visible transition-all",
        isCurrentPlan && "border-primary ring-2 ring-primary/20",
        disabled && "opacity-60"
      )}
    >
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Plano Atual</Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{plan.name}</span>
          {isCurrentPlan && <Crown className="h-5 w-5 text-primary" />}
        </CardTitle>
        <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <span className="text-3xl font-bold">{formatPrice(plan.monthly_price)}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>

        {plan.benefits && plan.benefits.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Recursos:</p>
            <ul className="space-y-1">
              {plan.benefits.slice(0, 5).map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    {benefit.benefit_label}
                    {benefit.value ? `: ${benefit.value}` : ""}
                  </span>
                </li>
              ))}
              {plan.benefits.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  +{plan.benefits.length - 5} mais...
                </li>
              )}
            </ul>
          </div>
        )}

        {!isCurrentPlan && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onSubscribe(plan.id)}
            disabled={isLoading || disabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : disabled ? (
              (disabledReason ?? "Indisponível")
            ) : plan.monthly_price === 0 ? (
              "Selecionar plano gratuito"
            ) : (
              "Assinar agora"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface CurrentPlanInfoProps {
  plan: Plan;
  clinicPlan: {
    status: string;
    started_at: string;
    expires_at: string | null;
  };
  onCancel?: () => void;
  cancelLoading?: boolean;
}

function CurrentPlanInfo({ plan, clinicPlan, onCancel, cancelLoading }: CurrentPlanInfoProps) {
  const isFree = clinicPlan.status === "free" || plan.monthly_price === 0;
  const isTrial = clinicPlan.status === "trial";
  const startedDate = new Date(clinicPlan.started_at);
  const expiresDate = clinicPlan.expires_at ? new Date(clinicPlan.expires_at) : null;
  const now = new Date();
  const daysLeft = expiresDate
    ? Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;

  const statusLabel =
    clinicPlan.status === "free"
      ? "Gratuito"
      : clinicPlan.status === "trial"
        ? "Trial"
        : clinicPlan.status === "active"
          ? "Ativo"
          : clinicPlan.status === "expired"
            ? "Expirado"
            : clinicPlan.status === "cancelled"
              ? "Cancelado"
              : clinicPlan.status;

  return (
    <Card className={isExpired ? "border-destructive" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plano Atual
          </div>
          <Badge
            variant={
              isExpired
                ? "destructive"
                : clinicPlan.status === "trial"
                  ? "secondary"
                  : clinicPlan.status === "free"
                    ? "outline"
                    : "default"
            }
          >
            {statusLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">{plan.name}</p>
          <p className="text-muted-foreground">{plan.description}</p>
        </div>

        {!isFree && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
            <div>
              <p className="text-xs text-muted-foreground">Início</p>
              <p className="font-medium">{startedDate.toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vencimento</p>
              <p className="font-medium">{expiresDate?.toLocaleDateString("pt-BR") ?? "—"}</p>
            </div>
          </div>
        )}

        {isFree && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Plano gratuito com funcionalidades básicas.
            </p>
          </div>
        )}

        {!isFree && daysLeft !== null && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg p-3",
              isExpired
                ? "bg-destructive/10 text-destructive"
                : isExpiringSoon
                  ? "bg-amber-100 text-amber-800"
                  : "bg-primary/10 text-primary"
            )}
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isExpired
                ? "Assinatura expirada. Renove para continuar usando recursos premium."
                : isExpiringSoon
                  ? `Falta ${daysLeft} dia(s). Renove agora para não perder acesso.`
                  : `${daysLeft} dia(s) restante(s)`}
            </span>
          </div>
        )}

        {isExpired && !isFree && (
          <div className="rounded-lg bg-destructive/5 p-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Sua assinatura expirou. Alguns recursos estão bloqueados.
            </p>
          </div>
        )}

        {!isFree && (
          <div className="flex gap-2">
            {!isTrial && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Cancelar assinatura
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PlanManagementClientProps {
  currentPlan: {
    plan: Plan | null;
    clinicPlan: ClinicPlan | null;
    hasUsedTrial?: boolean;
  };
  availablePlans: Plan[];
  plansEnabled?: boolean;
}

export function PlanManagementClient({
  currentPlan,
  availablePlans,
  plansEnabled = false,
}: PlanManagementClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const hasUsedTrial = currentPlan.hasUsedTrial;
  const currentStatus = currentPlan.clinicPlan?.status;

  const canCancel =
    currentStatus !== undefined &&
    currentStatus !== "free" &&
    currentStatus !== "trial" &&
    currentPlan.plan !== null;

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const portalReturn = searchParams.get("portal_return");

    if (success === "true") {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura realizada com sucesso!", {
        description: "Bem-vindo ao seu novo plano.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      router.replace("/plan");
    } else if (canceled === "true") {
      toast.info("Checkout cancelado", {
        description: "Sua assinatura não foi alterada.",
        icon: <XCircle className="h-5 w-5 text-muted-foreground" />,
      });
      router.replace("/plan");
    } else if (portalReturn === "true") {
      router.replace("/plan");
      syncStripeSubscription().then(({ synced }) => {
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        if (synced) {
          toast.success("Assinatura cancelada com sucesso!", {
            description: "Seu plano foi atualizado para Gratuito.",
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
        } else {
          toast.info("Retorno do portal de pagamentos", {
            description: "Suas alterações serão aplicadas em breve.",
          });
        }
        router.refresh();
      });
    }
  }, [searchParams, router, queryClient]);

  async function handleSubscribe(planId: string) {
    setLoadingPlanId(planId);
    setError(null);

    const result = await requestPlanChange(planId, "monthly");

    if (result.success) {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        toast.success("Plano ativado com sucesso!");
        router.refresh();
      }
    } else {
      setError(result.error ?? "Erro ao processar assinatura");
      toast.error(result.error ?? "Erro ao processar assinatura");
    }

    setLoadingPlanId(null);
  }

  async function handleCancelConfirm() {
    setCancelLoading(true);
    setShowCancelDialog(false);

    const result = await cancelSubscription();

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura cancelada com sucesso!", {
        description: "Seu plano foi atualizado para Gratuito.",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
      router.refresh();
    } else {
      toast.error(result.error ?? "Erro ao cancelar assinatura");
    }

    setCancelLoading(false);
  }

  const currentPlanId = currentPlan.plan?.id;

  return (
    <div className="space-y-8">
      {currentPlan.plan && currentPlan.clinicPlan && (
        <CurrentPlanInfo
          plan={currentPlan.plan}
          clinicPlan={currentPlan.clinicPlan}
          onCancel={canCancel ? () => setShowCancelDialog(true) : undefined}
          cancelLoading={cancelLoading}
        />
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar? Sua assinatura Stripe será encerrada imediatamente e
              o plano será rebaixado para <strong>Gratuito</strong>. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Cancelar assinatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Planos Disponíveis</h2>
          <p className="text-sm text-muted-foreground">Escolha o plano ideal para sua clínica.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availablePlans.map((plan) => {
            const isFree = plan.monthly_price === 0;
            const isTrial = plan.name === "Trial";
            const trialDisabled = isTrial && !!hasUsedTrial;
            const paidDisabled = !plansEnabled && !isFree;
            const disabled = trialDisabled || paidDisabled;
            const disabledReason = trialDisabled
              ? "Você já utilizou o Trial anteriormente"
              : paidDisabled
                ? "Planos pagos indisponíveis no momento"
                : undefined;
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={plan.id === currentPlanId}
                onSubscribe={handleSubscribe}
                loadingPlanId={loadingPlanId}
                disabled={disabled}
                disabledReason={disabledReason}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
