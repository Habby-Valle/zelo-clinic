"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CreditCard,
  AlertCircle,
  Crown,
  CheckCircle,
  XCircle,
  Loader2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { requestPlanChange, asaasSubscribe, cancelSubscription, getMyClinicPlan } from "./actions";
import type { Plan, ClinicPlan } from "@/features/plan/types";

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  hasActivePaidPlan: boolean;
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
  hasActivePaidPlan,
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
            variant={hasActivePaidPlan ? "default" : "outline"}
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
              hasActivePaidPlan ? (
                "Mudar para gratuito"
              ) : (
                "Selecionar plano gratuito"
              )
            ) : hasActivePaidPlan ? (
              "Alterar para este plano"
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
  const isCancelled = clinicPlan.status === "cancelled";
  const startedDate = new Date(clinicPlan.started_at);
  const expiresDate = clinicPlan.expires_at ? new Date(clinicPlan.expires_at) : null;
  const now = new Date();
  const daysLeft = expiresDate
    ? Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;
  const hasAccessUntilEnd = isCancelled && !isExpired && expiresDate;

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
              ? hasAccessUntilEnd
                ? "Cancelado"
                : "Cancelado"
              : clinicPlan.status === "pending"
                ? "Pendente"
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
              isExpired || (isCancelled && !hasAccessUntilEnd)
                ? "destructive"
                : clinicPlan.status === "trial"
                  ? "secondary"
                  : clinicPlan.status === "free"
                    ? "outline"
                    : clinicPlan.status === "cancelled"
                      ? "outline"
                      : clinicPlan.status === "pending"
                        ? "secondary"
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

        {!isFree && daysLeft !== null && !hasAccessUntilEnd && (
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

        {hasAccessUntilEnd && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Acesso mantido até {expiresDate.toLocaleDateString("pt-BR")} (
              {daysLeft} dia{daysLeft !== 1 ? "s" : ""}). Renove para continuar.
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

        {!isFree && !isCancelled && (
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeTargetPlanId, setChangeTargetPlanId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [subscribeResult, setSubscribeResult] = useState<{
    pixQrCode?: string;
    pixPayload?: string;
    checkoutUrl?: string;
    billingType?: string;
    error?: string;
    prorataCharge?: { value: number; pixQrCode: string; pixPayload: string };
  } | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const subscribingRef = useRef(false);
  const hasUsedTrial = currentPlan.hasUsedTrial;
  const currentStatus = currentPlan.clinicPlan?.status;

  const canCancel =
    currentStatus !== undefined &&
    currentStatus !== "free" &&
    currentStatus !== "trial" &&
    currentStatus !== "pending" &&
    currentPlan.plan !== null;

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

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
    }
  }, [searchParams, router, queryClient]);

  // Enquanto o QR PIX está na tela e o plano ainda não está ativo, consulta o
  // status periodicamente até o webhook confirmar o pagamento e ativar a
  // assinatura — então troca o QR por uma tela de sucesso.
  useEffect(() => {
    if (!showPaymentModal || !subscribeResult?.pixQrCode || pixConfirmed) return;
    // Upgrade (plano já ativo) não gera transição clara de status; mantém o QR.
    if (currentStatus === "active") return;

    let cancelled = false;
    const interval = setInterval(async () => {
      const info = await getMyClinicPlan();
      if (!cancelled && info?.clinicPlan?.status === "active") {
        setPixConfirmed(true);
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        router.refresh();
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [showPaymentModal, subscribeResult?.pixQrCode, pixConfirmed, currentStatus, queryClient, router]);

  const hasPaidPlan =
    currentPlan.clinicPlan?.status === "active" && (currentPlan.plan?.monthly_price ?? 0) > 0;

  async function handleSubscribe(planId: string) {
    const result = await requestPlanChange(planId, "monthly");
    if (!result.success) {
      setError(result.error ?? "Erro ao processar");
      toast.error(result.error ?? "Erro ao processar");
      return;
    }

    if (result.billingType === null) {
      // Plano gratuito: se tiver plano pago, pede confirmacao
      if (hasPaidPlan) {
        setChangeTargetPlanId(planId);
        setShowChangeDialog(true);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plano ativado com sucesso!");
      router.refresh();
      return;
    }

    // Plano pago: se ja tem outro plano pago, pede confirmacao
    if (hasPaidPlan) {
      setChangeTargetPlanId(planId);
      setShowChangeDialog(true);
      return;
    }

    setSelectedPlanId(planId);
    setSubscribeResult(null);
    setShowPaymentModal(true);
  }

  async function handlePaymentChoice(billingType: "PIX" | "CREDIT_CARD") {
    if (!selectedPlanId || subscribingRef.current) return;
    subscribingRef.current = true;
    setSubscribing(true);
    setSubscribeResult(null);
    setPixConfirmed(false);

    try {
      const result = await asaasSubscribe(selectedPlanId, billingType, "MONTHLY");

      if (!result.success) {
        setSubscribeResult({ error: result.error });
        return;
      }

      if (result.billingType === "CREDIT_CARD" && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      setSubscribeResult({
        pixQrCode: result.pixQrCode,
        pixPayload: result.pixPayload,
        billingType: result.billingType,
        prorataCharge: result.prorataCharge,
      });
    } finally {
      setSubscribing(false);
      subscribingRef.current = false;
    }
  }

  async function handleCancelConfirm() {
    setCancelLoading(true);
    setShowCancelDialog(false);

    const result = await cancelSubscription();

    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Assinatura cancelada com sucesso!", {
        description: "Você mantém acesso aos recursos pagos até o fim do ciclo vigente.",
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
              Tem certeza que deseja cancelar? A cobrança será encerrada, mas você mantém acesso
              aos recursos pagos até o fim do ciclo vigente (<strong>{currentPlan.clinicPlan?.expires_at ? new Date(currentPlan.clinicPlan.expires_at).toLocaleDateString("pt-BR") : "—"}</strong>). Depois, o plano será rebaixado para <strong>Gratuito</strong>.
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

      {/* Payment Method Modal */}
      <Dialog
        open={showPaymentModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowPaymentModal(false);
            setSubscribeResult(null);
            setPixConfirmed(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forma de Pagamento</DialogTitle>
            <DialogDescription>Escolha como deseja pagar sua assinatura.</DialogDescription>
          </DialogHeader>

          {subscribeResult?.error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {subscribeResult.error}
            </div>
          )}

          {subscribeResult?.pixQrCode ? (
            pixConfirmed ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <div>
                <p className="text-lg font-semibold">Pagamento confirmado!</p>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura foi ativada com sucesso.
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSubscribeResult(null);
                  setPixConfirmed(false);
                  queryClient.invalidateQueries({ queryKey: ["subscription"] });
                  router.refresh();
                }}
              >
                Concluir
              </Button>
            </div>
            ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                <QrCode className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Pagamento via PIX</p>
                  <p className="text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie o código abaixo.
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${subscribeResult.pixQrCode}`}
                  alt="QR Code PIX"
                  className="h-48 w-48"
                />
              </div>
              {subscribeResult.pixPayload && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Código PIX (copia e cola)</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border bg-muted px-3 py-2 font-mono text-xs"
                      value={subscribeResult.pixPayload}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(subscribeResult.pixPayload!);
                        toast.success("Código PIX copiado!");
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              )}
              {(() => {
                const pc = subscribeResult.prorataCharge;
                if (!pc) return null;
                return (
                  <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      Cobrança adicional proporcional
                    </p>
                    <p className="text-xs text-amber-700">
                      Valor referente à diferença do upgrade proporcional aos dias restantes do
                      ciclo atual: <strong>R$ {pc.value.toFixed(2)}</strong>
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={`data:image/png;base64,${pc.pixQrCode}`}
                        alt="QR Code PIX proporcional"
                        className="h-40 w-40"
                      />
                    </div>
                    {pc.pixPayload && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Código PIX (copia e cola)
                        </label>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 rounded-lg border bg-white px-3 py-2 font-mono text-xs"
                            value={pc.pixPayload}
                            readOnly
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(pc.pixPayload!);
                              toast.success("Código PIX copiado!");
                            }}
                          >
                            Copiar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Aguardando confirmação do pagamento…
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSubscribeResult(null);
                  setPixConfirmed(false);
                  queryClient.invalidateQueries({ queryKey: ["subscription"] });
                  router.refresh();
                }}
              >
                Fechar
              </Button>
            </div>
            )
          ) : (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="h-14 w-full justify-start gap-3"
                onClick={() => handlePaymentChoice("PIX")}
                disabled={subscribing}
              >
                <QrCode className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">PIX</p>
                  <p className="text-xs text-muted-foreground">Pagamento instantâneo via QR Code</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-14 w-full justify-start gap-3"
                onClick={() => handlePaymentChoice("CREDIT_CARD")}
                disabled={subscribing}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Cartão de Crédito</p>
                  <p className="text-xs text-muted-foreground">
                    Pagamento via checkout seguro ASAAS
                  </p>
                </div>
              </Button>
              {subscribing && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSubscribeResult(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change plan confirmation */}
      <AlertDialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar plano</AlertDialogTitle>
            <AlertDialogDescription>
              {hasPaidPlan
                ? "Você já possui um plano pago ativo. Ao alterar, a diferença proporcional dos dias restantes do ciclo atual será cobrada no PIX (se aplicável). Deseja continuar?"
                : "Deseja alterar para este plano?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowChangeDialog(false);
                const pid = changeTargetPlanId;
                if (!pid) return;
                const resultPromise = requestPlanChange(pid, "monthly");
                resultPromise.then((result) => {
                  if (!result.success) {
                    setError(result.error ?? "Erro ao processar");
                    toast.error(result.error ?? "Erro ao processar");
                    return;
                  }
                  if (result.billingType === null) {
                    queryClient.invalidateQueries({ queryKey: ["subscription"] });
                    toast.success("Plano alterado com sucesso!");
                    router.refresh();
                  } else {
                    setSelectedPlanId(pid);
                    setSubscribeResult(null);
                    setShowPaymentModal(true);
                  }
                });
              }}
            >
              Continuar
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
                hasActivePaidPlan={hasPaidPlan}
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
