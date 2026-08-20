"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard,
  AlertCircle,
  Loader2,
  ChevronLeft,
  History,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { cancelSubscription, openBillingPortal } from "../actions";
import type {
  GatewaySubscription,
  PlanPayment,
} from "@/features/plan/services/clinic-billing.service";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencido",
  canceled: "Cancelado",
  refunded: "Estornado",
};

const PAYMENT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> =
  {
    paid: "default",
    pending: "secondary",
    overdue: "destructive",
    canceled: "outline",
    refunded: "outline",
  };

function formatBRL(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

interface ManageSubscriptionClientProps {
  clinicName: string;
  subscription: GatewaySubscription | null;
  payments: PlanPayment[];
}

export function ManageSubscriptionClient({
  clinicName,
  subscription,
  payments,
}: ManageSubscriptionClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  const statusLabel =
    subscription?.status === "active"
      ? "Ativa"
      : subscription?.status === "past_due"
        ? "Inadimplente"
        : subscription?.status === "canceled"
          ? "Cancelada"
          : (subscription?.status ?? "—");

  const statusVariant =
    subscription?.status === "active"
      ? "default"
      : subscription?.status === "past_due"
        ? "destructive"
        : "outline";

  const periodEnd = subscription?.current_period_end
    ? formatDate(subscription.current_period_end)
    : "—";

  /** O portal do Stripe cuida da troca de cartão e das faturas.
   *
   *  Cancelamento e troca de plano ficam de fora dele de propósito: passam
   *  pelas nossas telas, que é onde estão o aviso no ato e as regras de
   *  proporcionalidade. */
  async function handleChangeCard() {
    setOpeningPortal(true);
    const res = await openBillingPortal();
    if (res.success && res.portalUrl) {
      window.location.href = res.portalUrl;
      return;
    }
    toast.error(res.error ?? "Não foi possível abrir o gerenciamento de pagamento");
    setOpeningPortal(false);
  }

  async function handleCancel() {
    if (
      !confirm(
        "Tem certeza que deseja cancelar? A cobrança será encerrada, mas você mantém acesso aos recursos pagos até o fim do ciclo vigente. Depois, o plano será bloqueado."
      )
    )
      return;
    setCancelling(true);
    const res = await cancelSubscription();
    if (res.success) {
      toast.success("Assinatura cancelada com sucesso!");
      router.refresh();
    } else {
      toast.error(res.error ?? "Erro ao cancelar assinatura");
    }
    setCancelling(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">Forma de pagamento e histórico de cobranças.</p>
        </div>
      </div>

      {!subscription ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Nenhuma assinatura ativa</p>
            <p className="text-sm text-muted-foreground">
              Sua clínica ainda não possui uma assinatura em andamento.
            </p>
            <Button onClick={() => router.push("/plan")}>Ver planos</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Assinatura
            </CardTitle>
            <CardDescription>
              A cobrança é mensal, no cartão, e renova sozinha até você cancelar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
              <div>
                <p className="text-xs text-muted-foreground">Clínica</p>
                <p className="font-medium">{clinicName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={statusVariant}>{statusLabel}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plano</p>
                <p className="font-medium">{subscription.plan_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {subscription.cancel_at_period_end ? "Acesso até" : "Próxima cobrança"}
                </p>
                <p className="font-medium">{periodEnd}</p>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Assinatura cancelada. Você mantém acesso aos recursos pagos até {periodEnd} e não
                  haverá nova cobrança.
                </p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleChangeCard}
              disabled={openingPortal}
            >
              {openingPortal ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Atualizar forma de pagamento
            </Button>

            {payments.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <History className="h-4 w-4" />
                  Histórico de Pagamentos
                </h3>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Recibo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Fatura</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">
                            {formatDate(p.paid_at || p.due_date)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {formatBRL(p.amount)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {p.receipt_number ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={PAYMENT_STATUS_VARIANTS[p.status] ?? "outline"}>
                              {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {p.hosted_invoice_url ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(p.hosted_invoice_url, "_blank", "noopener")
                                }
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Ver
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {subscription.status === "active" && !subscription.cancel_at_period_end && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Cancelar assinatura
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
