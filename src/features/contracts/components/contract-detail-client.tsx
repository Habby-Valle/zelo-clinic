"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  PauseCircle,
  PlayCircle,
  Ban,
  Pencil,
  Sparkles,
  Check,
  X,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WEEKDAY_LABELS } from "@/features/shifts/lib/shift-time";
import { usePlanFeature } from "@/features/plan";
import {
  useContract,
  useTransitionContract,
  useUpdateContract,
  usePricingSuggestion,
} from "../hooks";
import type { ContractStatus } from "../types";
import { CONTRACT_STATUS_LABELS, PATIENT_HEALTH_STATUS_LABELS } from "../types";

const STATUS_VARIANTS: Record<ContractStatus, "default" | "secondary" | "destructive" | "outline"> =
  {
    draft: "outline",
    active: "default",
    suspended: "outline",
    cancelled: "destructive",
    expired: "outline",
  };

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function ContractDetailClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: contract, isLoading } = useContract(id);
  const transitionContract = useTransitionContract(id);
  const updateContract = useUpdateContract(id);

  const [lifecycleAction, setLifecycleAction] = useState<
    "suspend" | "reactivate" | "cancel" | null
  >(null);
  const [lifecycleReason, setLifecycleReason] = useState("");
  const [pricingEnabled, setPricingEnabled] = useState(false);
  const { data: pricingSuggestion, isLoading: pricingLoading } = usePricingSuggestion(
    id,
    pricingEnabled
  );

  const [editPricing, setEditPricing] = useState(false);
  const [billingMode, setBillingMode] = useState("per_hour");
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerShift, setPricePerShift] = useState("");
  const [fixedMonthlyAmount, setFixedMonthlyAmount] = useState("");
  const [nightSurcharge, setNightSurcharge] = useState("");
  const [nightSurchargeType, setNightSurchargeType] = useState("percentage");
  const canPricingSuggestion = usePlanFeature("has_pricing_suggestions");

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

  const formatCurrency = (value: string | null | undefined): string => {
    if (!value) return "—";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number(value)
    );
  };

  const startEditPricing = () => {
    setBillingMode(contract.billing_mode);
    setPricePerHour(contract.price_per_hour ?? "");
    setPricePerShift(contract.price_per_shift ?? "");
    setFixedMonthlyAmount(contract.fixed_monthly_amount ?? "");
    setNightSurcharge(contract.night_surcharge || "0");
    setNightSurchargeType(contract.night_surcharge_type);
    setEditPricing(true);
  };

  const savePricing = () => {
    const payload: Parameters<typeof updateContract.mutate>[0] = {
      billing_mode: billingMode as "per_hour" | "per_shift" | "fixed",
      price_per_hour: billingMode === "per_hour" && pricePerHour ? Number(pricePerHour) : undefined,
      price_per_shift:
        billingMode === "per_shift" && pricePerShift ? Number(pricePerShift) : undefined,
      fixed_monthly_amount:
        billingMode === "fixed" && fixedMonthlyAmount ? Number(fixedMonthlyAmount) : undefined,
      night_surcharge: nightSurcharge ? Number(nightSurcharge) : 0,
      night_surcharge_type: nightSurchargeType as "percentage" | "fixed_amount",
    };
    updateContract.mutate(payload, {
      onSuccess: () => setEditPricing(false),
    });
  };

  const applySuggestion = () => {
    if (!pricingSuggestion) return;
    if (billingMode === "per_hour" && pricingSuggestion.price_per_hour_suggested) {
      setPricePerHour(pricingSuggestion.price_per_hour_suggested);
    }
    if (billingMode === "per_shift" && pricingSuggestion.price_per_shift_suggested) {
      setPricePerShift(pricingSuggestion.price_per_shift_suggested);
    }
    if (pricingSuggestion.night_surcharge_suggested) {
      setNightSurcharge(pricingSuggestion.night_surcharge_suggested);
    }
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
            <CardTitle className="text-base">Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Criado em" value={formatDate(contract.created_at)} />
            <Row label="Atualizado em" value={formatDate(contract.updated_at)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="h-4 w-4 text-muted-foreground" />
            Cobrança / Valor
          </CardTitle>
          {!editPricing && (
            <Button variant="outline" size="sm" onClick={startEditPricing}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-xs text-muted-foreground">
            Referência de custo para o relatório — a cobrança do cuidado é feita pela clínica, fora
            do Zelo.
          </p>

          {!editPricing ? (
            <div className="space-y-3">
              <Row
                label="Modo de cobrança"
                value={
                  contract.billing_mode === "per_hour"
                    ? "Por hora"
                    : contract.billing_mode === "per_shift"
                      ? "Por turno"
                      : "Mensal fixo"
                }
              />
              {contract.billing_mode === "per_hour" && (
                <Row label="Preço por hora" value={formatCurrency(contract.price_per_hour)} />
              )}
              {contract.billing_mode === "per_shift" && (
                <Row label="Preço por turno" value={formatCurrency(contract.price_per_shift)} />
              )}
              {contract.billing_mode === "fixed" && (
                <Row
                  label="Valor mensal fixo"
                  value={formatCurrency(contract.fixed_monthly_amount)}
                />
              )}
              <Row
                label="Adicional noturno"
                value={
                  contract.night_surcharge && Number(contract.night_surcharge) > 0
                    ? `${contract.night_surcharge}${contract.night_surcharge_type === "percentage" ? "%" : " (fixo)"}`
                    : "Nenhum"
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="billing-mode">Modo de cobrança</Label>
                  <Select
                    value={billingMode}
                    onValueChange={(v) => setBillingMode(v ?? "per_hour")}
                  >
                    <SelectTrigger id="billing-mode" className="w-full">
                      <SelectValue>
                        {(v: string | null) =>
                          v === "per_shift"
                            ? "Por turno"
                            : v === "fixed"
                              ? "Mensal fixo"
                              : "Por hora"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_hour">Por hora</SelectItem>
                      <SelectItem value="per_shift">Por turno</SelectItem>
                      <SelectItem value="fixed">Mensal fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="night-surcharge">Adicional noturno</Label>
                  <Input
                    id="night-surcharge"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={nightSurcharge}
                    onChange={(e) => setNightSurcharge(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {billingMode === "per_hour" && (
                  <div className="space-y-1">
                    <Label htmlFor="price-per-hour">Preço por hora (R$)</Label>
                    <Input
                      id="price-per-hour"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex.: 40,00"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                    />
                  </div>
                )}
                {billingMode === "per_shift" && (
                  <div className="space-y-1">
                    <Label htmlFor="price-per-shift">Preço por turno (R$)</Label>
                    <Input
                      id="price-per-shift"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex.: 300,00"
                      value={pricePerShift}
                      onChange={(e) => setPricePerShift(e.target.value)}
                    />
                  </div>
                )}
                {billingMode === "fixed" && (
                  <div className="space-y-1">
                    <Label htmlFor="fixed-monthly">Valor mensal (R$)</Label>
                    <Input
                      id="fixed-monthly"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex.: 5000,00"
                      value={fixedMonthlyAmount}
                      onChange={(e) => setFixedMonthlyAmount(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="night-surcharge-type">Tipo do adicional</Label>
                  <Select
                    value={nightSurchargeType}
                    onValueChange={(v) => setNightSurchargeType(v ?? "percentage")}
                  >
                    <SelectTrigger id="night-surcharge-type" className="w-full">
                      <SelectValue>
                        {(v: string | null) =>
                          v === "fixed_amount" ? "Valor fixo (R$)" : "Percentual (%)"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed_amount">Valor fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" disabled={updateContract.isPending} onClick={savePricing}>
                  {updateContract.isPending && (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  )}
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Salvar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditPricing(false)}>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Cancelar
                </Button>
              </div>

              {canPricingSuggestion && (
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
                          {formatCurrency(pricingSuggestion.price_per_hour_suggested)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Preço/turno sugerido:</span>
                        <span className="font-medium">
                          {formatCurrency(pricingSuggestion.price_per_shift_suggested)}
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
                          variant={
                            pricingSuggestion.confidence === "high" ? "default" : "secondary"
                          }
                        >
                          {pricingSuggestion.confidence === "high" ? "Alta" : "Média"}
                        </Badge>
                      </div>
                      {pricingSuggestion.explanation && (
                        <p className="mt-1 text-xs text-muted-foreground italic">
                          {pricingSuggestion.explanation}
                        </p>
                      )}
                      <Button size="sm" className="mt-2 w-full" onClick={applySuggestion}>
                        Aplicar sugestão
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
