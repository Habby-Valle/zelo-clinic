"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  PauseCircle,
  PlayCircle,
  Ban,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { generateInvoiceApi } from "@/features/billing/services";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  useContract,
  useSendProposal,
  useRejectContract,
  useTransitionContract,
  usePricingSuggestion,
} from "../hooks";
import type { ContractStatus, PricingSuggestion } from "../types";
import { CONTRACT_STATUS_LABELS, PATIENT_HEALTH_STATUS_LABELS } from "../types";
import { usePlanLimits } from "@/features/plan";
import { WEEKDAY_LABELS } from "@/features/shifts/lib/shift-time";

const STATUS_VARIANTS: Record<ContractStatus, "default" | "secondary" | "destructive" | "outline"> =
  {
    requested: "secondary",
    proposal_sent: "secondary",
    draft: "outline",
    active: "default",
    suspended: "outline",
    cancelled: "destructive",
    expired: "outline",
  };

function formatCurrency(value: string | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function ContractDetailClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: contract, isLoading } = useContract(id);
  const { data: planLimits } = usePlanLimits();
  const sendProposal = useSendProposal(id);
  const rejectContract = useRejectContract(id);
  const transitionContract = useTransitionContract(id);

  const [proposalOpen, setProposalOpen] = useState(false);

  const handleProposalOpenChange = (open: boolean) => {
    setProposalOpen(open);
    if (!open) {
      setPricingEnabled(false);
    }
  };
  const [rejectOpen, setRejectOpen] = useState(false);
  // Ciclo de vida: 'suspend' | 'reactivate' | 'cancel' | null
  const [lifecycleAction, setLifecycleAction] = useState<
    "suspend" | "reactivate" | "cancel" | null
  >(null);
  const [lifecycleReason, setLifecycleReason] = useState("");
  const [genInvoiceOpen, setGenInvoiceOpen] = useState(false);
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerShift, setPricePerShift] = useState("");
  const [billingMode, setBillingMode] = useState<"per_shift" | "per_hour" | "fixed">("per_shift");
  const [fixedMonthlyAmount, setFixedMonthlyAmount] = useState("");
  const [pricingEnabled, setPricingEnabled] = useState(false);

  const { data: pricingSuggestion, isLoading: pricingLoading } = usePricingSuggestion(
    id,
    pricingEnabled
  );
  const [genMonth, setGenMonth] = useState(new Date().getMonth());
  const [genYear, setGenYear] = useState(new Date().getFullYear());

  const router = useRouter();

  const generateInvoice = useMutation({
    mutationFn: () => {
      const periodEnd = new Date(genYear, genMonth, 0);
      const periodStart = new Date(genYear, genMonth - 1, 1);
      return generateInvoiceApi({
        contract_id: id,
        period_start: periodStart.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
      });
    },
    onSuccess: (data) => {
      setGenInvoiceOpen(false);
      const invoiceId = String(data.id ?? "");
      if (invoiceId) {
        router.push(`/billing/${invoiceId}`);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">Contrato não encontrado</p>
        <Link href="/contracts" className={cn(buttonVariants({ variant: "outline" }))}>
          Voltar para contratos
        </Link>
      </div>
    );
  }

  const handleSendProposal = () => {
    sendProposal.mutate(
      {
        billing_mode: billingMode,
        price_per_hour:
          billingMode === "per_hour" && pricePerHour ? Number(pricePerHour) : undefined,
        price_per_shift:
          billingMode === "per_shift" && pricePerShift ? Number(pricePerShift) : undefined,
        fixed_monthly_amount:
          billingMode === "fixed" && fixedMonthlyAmount ? Number(fixedMonthlyAmount) : undefined,
      },
      {
        onSuccess: () => {
          setProposalOpen(false);
        },
      }
    );
  };

  // Campo obrigatório conforme o modo de cobrança escolhido.
  const proposalReady =
    billingMode === "fixed"
      ? !!fixedMonthlyAmount
      : billingMode === "per_hour"
        ? !!pricePerHour
        : !!pricePerShift;

  const handleReject = () => {
    rejectContract.mutate(undefined, {
      onSuccess: () => {
        setRejectOpen(false);
      },
    });
  };

  const closeLifecycle = () => {
    setLifecycleAction(null);
    setLifecycleReason("");
  };

  const handleLifecycle = () => {
    if (!lifecycleAction) return;
    const statusMap = {
      suspend: "suspended",
      reactivate: "active",
      cancel: "cancelled",
    } as const;
    transitionContract.mutate(
      { status: statusMap[lifecycleAction], reason: lifecycleReason.trim() },
      { onSuccess: closeLifecycle }
    );
  };

  const LIFECYCLE_COPY = {
    suspend: {
      title: "Suspender contrato",
      description:
        "O contrato fica suspenso e os turnos agendados futuros são cancelados. Você pode reativá-lo depois.",
      confirm: "Suspender",
      reasonRequired: false,
    },
    reactivate: {
      title: "Reativar contrato",
      description: "O contrato volta a ficar ativo e novos turnos podem ser agendados.",
      confirm: "Reativar",
      reasonRequired: false,
    },
    cancel: {
      title: "Encerrar contrato",
      description:
        "O contrato é encerrado definitivamente e os turnos agendados futuros são cancelados. Esta ação não pode ser desfeita.",
      confirm: "Encerrar",
      reasonRequired: true,
    },
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/contracts"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{contract.contract_number}</h1>
            <Badge variant={STATUS_VARIANTS[contract.status]}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {contract.patient_name} — {contract.clinic_name}
          </p>
        </div>
      </div>

      {(contract.status === "cancelled" ||
        contract.status === "suspended" ||
        contract.status === "expired") &&
        (contract.cancellation_reason || contract.ended_at) && (
          <Card className="border-muted bg-muted/40">
            <CardContent className="space-y-1 p-4 text-sm">
              <p className="font-medium">
                Contrato {CONTRACT_STATUS_LABELS[contract.status].toLowerCase()}
                {contract.ended_at ? ` em ${formatDate(contract.ended_at)}` : ""}
                {contract.cancelled_by_name ? ` por ${contract.cancelled_by_name}` : ""}.
              </p>
              {contract.cancellation_reason && (
                <p className="text-muted-foreground">
                  <span className="font-medium">Motivo:</span> {contract.cancellation_reason}
                </p>
              )}
            </CardContent>
          </Card>
        )}

      {contract.status === "requested" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">Esta solicitação aguarda uma proposta de valores.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRejectOpen(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Recusar
              </Button>
              <Button onClick={() => setProposalOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Enviar proposta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {contract.status === "proposal_sent" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">
              Proposta enviada. Aguardando a resposta da família.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setPricePerHour(contract.price_per_hour ?? "");
                setPricePerShift(contract.price_per_shift ?? "");
                setProposalOpen(true);
              }}
            >
              Revisar proposta
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Nº do contrato" value={contract.contract_number} />
            <Row label="Status" value={CONTRACT_STATUS_LABELS[contract.status]} />
            <Row label="Data de início" value={formatDate(contract.start_date)} />
            <Row
              label="Data de término"
              value={contract.end_date ? formatDate(contract.end_date) : "Indeterminado"}
            />
            <Row label="Horas semanais" value={`${contract.weekly_hours}h`} />
            <Row
              label="Dias preferidos"
              value={
                contract.preferred_weekdays && contract.preferred_weekdays.length > 0
                  ? contract.preferred_weekdays
                      .map((i) => WEEKDAY_LABELS[i])
                      .filter(Boolean)
                      .join(", ")
                  : "—"
              }
            />
            <Row
              label="Horário preferido"
              value={
                contract.preferred_start_time && contract.preferred_end_time
                  ? `${contract.preferred_start_time.slice(0, 5)} às ${contract.preferred_end_time.slice(0, 5)}`
                  : "—"
              }
            />
            <Row label="Observações" value={contract.notes || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partes Envolvidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paciente</span>
              <Link href={`/patients/${contract.patient}`} className="font-medium hover:underline">
                {contract.patient_name}
              </Link>
            </div>
            <Row
              label="Cadastro de saúde"
              value={PATIENT_HEALTH_STATUS_LABELS[contract.patient_health_status]}
            />
            <Row label="Solicitante" value={contract.requested_by_name ?? contract.payer_name} />
            <Row label="Contratante" value={contract.payer_name} />
            <Row label="Clínica" value={contract.clinic_name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label="Modo de cobrança"
              value={
                contract.billing_mode === "per_hour"
                  ? "Por hora"
                  : contract.billing_mode === "fixed"
                    ? "Valor fixo mensal"
                    : "Por turno"
              }
            />
            {contract.billing_mode === "fixed" && (
              <Row
                label="Valor fixo mensal"
                value={formatCurrency(contract.fixed_monthly_amount)}
              />
            )}
            {contract.billing_mode === "per_hour" && (
              <Row label="Preço por hora" value={formatCurrency(contract.price_per_hour)} />
            )}
            {contract.billing_mode === "per_shift" && (
              <Row label="Preço por turno" value={formatCurrency(contract.price_per_shift)} />
            )}
            <Row
              label="Adicional noturno"
              value={
                contract.night_surcharge
                  ? contract.night_surcharge_type === "percentage"
                    ? `${contract.night_surcharge}%`
                    : formatCurrency(contract.night_surcharge)
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Criado em" value={formatDate(contract.created_at)} />
            <Row label="Atualizado em" value={formatDate(contract.updated_at)} />
          </CardContent>
        </Card>
      </div>

      {contract.status === "active" && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">Gerar fatura</p>
              <p className="text-xs text-muted-foreground">
                Cria uma fatura com base nos turnos conclu&iacute;dos do contrato.
              </p>
            </div>
            <Button variant="outline" onClick={() => setGenInvoiceOpen(true)}>
              <Receipt className="mr-2 h-4 w-4" />
              Gerar Fatura
            </Button>
          </CardContent>
        </Card>
      )}

      {(contract.status === "active" || contract.status === "suspended") && (
        <Card className="border-dashed">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">Gerenciar contrato</p>
              <p className="text-xs text-muted-foreground">
                {contract.status === "active"
                  ? "Suspenda temporariamente ou encerre o contrato."
                  : "Reative o contrato ou encerre definitivamente."}
              </p>
            </div>
            <div className="flex gap-2">
              {contract.status === "active" ? (
                <Button variant="outline" onClick={() => setLifecycleAction("suspend")}>
                  <PauseCircle className="mr-2 h-4 w-4" />
                  Suspender
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setLifecycleAction("reactivate")}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Reativar
                </Button>
              )}
              <Button variant="destructive" onClick={() => setLifecycleAction("cancel")}>
                <Ban className="mr-2 h-4 w-4" />
                Encerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={lifecycleAction !== null}
        onOpenChange={(v) => {
          if (!v) closeLifecycle();
        }}
      >
        <DialogContent>
          {lifecycleAction && (
            <>
              <DialogHeader>
                <DialogTitle>{LIFECYCLE_COPY[lifecycleAction].title}</DialogTitle>
                <DialogDescription>{LIFECYCLE_COPY[lifecycleAction].description}</DialogDescription>
              </DialogHeader>
              {lifecycleAction !== "reactivate" && (
                <div className="space-y-2 py-2">
                  <Label htmlFor="lifecycle-reason">
                    Motivo{LIFECYCLE_COPY[lifecycleAction].reasonRequired ? " *" : " (opcional)"}
                  </Label>
                  <Textarea
                    id="lifecycle-reason"
                    placeholder="Ex.: inadimplência, alta do paciente, mudança de instituição..."
                    value={lifecycleReason}
                    onChange={(e) => setLifecycleReason(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
              {transitionContract.error && (
                <p className="text-sm text-destructive">
                  {transitionContract.error instanceof Error
                    ? transitionContract.error.message
                    : "Erro ao atualizar contrato"}
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={closeLifecycle}>
                  Cancelar
                </Button>
                <Button
                  variant={lifecycleAction === "cancel" ? "destructive" : "default"}
                  onClick={handleLifecycle}
                  disabled={
                    transitionContract.isPending ||
                    (LIFECYCLE_COPY[lifecycleAction].reasonRequired && !lifecycleReason.trim())
                  }
                >
                  {transitionContract.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {LIFECYCLE_COPY[lifecycleAction].confirm}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={proposalOpen} onOpenChange={handleProposalOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Proposta</DialogTitle>
            <DialogDescription>
              Defina os valores. A família recebe a proposta e decide se aceita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {planLimits?.limits?.has_pricing_suggestions !== false && (
              <div className="rounded-lg border border-dashed p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Precificação Inteligente
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pricingLoading}
                    onClick={() => setPricingEnabled(true)}
                  >
                    {pricingLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Sugerir preços
                  </Button>
                </div>
                {pricingSuggestion && (
                  <div className="mt-3 space-y-2 rounded-md bg-muted/50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preço/h sugerido:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(pricingSuggestion.price_per_hour_suggested))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preço/turno sugerido:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(pricingSuggestion.price_per_shift_suggested))}
                      </span>
                    </div>
                    {pricingSuggestion.factors.region && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Região de referência:</span>
                        <span>{pricingSuggestion.factors.region}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Confiança:</span>
                      <Badge
                        variant={pricingSuggestion.confidence === "high" ? "default" : "secondary"}
                      >
                        {pricingSuggestion.confidence === "high" ? "Alta" : "Média"}
                      </Badge>
                    </div>
                    {pricingSuggestion.explanation && (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        {pricingSuggestion.explanation}
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        setPricePerHour(pricingSuggestion.price_per_hour_suggested);
                        setPricePerShift(pricingSuggestion.price_per_shift_suggested);
                      }}
                    >
                      Aplicar sugestão
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="billing_mode">Modo de cobrança</Label>
              <Select
                value={billingMode}
                onValueChange={(v) =>
                  setBillingMode((v ?? "per_shift") as "per_shift" | "per_hour" | "fixed")
                }
              >
                <SelectTrigger id="billing_mode">
                  <SelectValue>
                    {(v: string | null) => {
                      const labels: Record<string, string> = {
                        per_shift: "Por turno",
                        per_hour: "Por hora",
                        fixed: "Valor fixo mensal",
                      };
                      return labels[v ?? ""] ?? v ?? "Por turno";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_shift">Por turno</SelectItem>
                  <SelectItem value="per_hour">Por hora</SelectItem>
                  <SelectItem value="fixed">Valor fixo mensal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {billingMode === "per_shift"
                  ? "Cada turno concluído é cobrado pelo preço por turno."
                  : billingMode === "per_hour"
                    ? "Cobra as horas efetivamente trabalhadas × preço por hora."
                    : "Cobra um valor fixo por mês, independente dos turnos."}
              </p>
            </div>
            {billingMode === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="fixed_monthly_amount">Valor fixo mensal (R$)</Label>
                <Input
                  id="fixed_monthly_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={fixedMonthlyAmount}
                  onChange={(e) => setFixedMonthlyAmount(e.target.value)}
                />
              </div>
            )}
            {billingMode === "per_hour" && (
              <div className="space-y-2">
                <Label htmlFor="price_per_hour">Preço por hora (R$)</Label>
                <Input
                  id="price_per_hour"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                />
              </div>
            )}
            {billingMode === "per_shift" && (
              <div className="space-y-2">
                <Label htmlFor="price_per_shift">Preço por turno (R$)</Label>
                <Input
                  id="price_per_shift"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={pricePerShift}
                  onChange={(e) => setPricePerShift(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendProposal}
              disabled={sendProposal.isPending || !proposalReady}
            >
              {sendProposal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja recusar este contrato? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={rejectContract.isPending}
              onClick={handleReject}
            >
              {rejectContract.isPending ? "Recusando..." : "Sim, Recusar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={genInvoiceOpen} onOpenChange={setGenInvoiceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Fatura</DialogTitle>
            <DialogDescription>
              Selecione o m&ecirc;s de refer&ecirc;ncia para a fatura.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 py-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="gen-month">M&ecirc;s</Label>
              <select
                id="gen-month"
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={genMonth}
                onChange={(e) => setGenMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleDateString("pt-BR", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="gen-year">Ano</Label>
              <select
                id="gen-year"
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={genYear}
                onChange={(e) => setGenYear(Number(e.target.value))}
              >
                {Array.from({ length: 3 }, (_, i) => {
                  const y = new Date().getFullYear() - 1 + i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          {generateInvoice.error && (
            <p className="text-sm text-destructive">
              {generateInvoice.error instanceof Error
                ? generateInvoice.error.message
                : "Erro ao gerar fatura"}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenInvoiceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => generateInvoice.mutate()} disabled={generateInvoice.isPending}>
              {generateInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
