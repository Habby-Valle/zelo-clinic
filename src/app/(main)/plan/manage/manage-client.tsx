"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CreditCard,
  QrCode,
  AlertCircle,
  Loader2,
  ChevronLeft,
  History,
  CheckCircle,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getPlanPaymentPix, manageGetClinic, type PlanPayment } from "../actions";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencido",
  refunded: "Estornado",
  chargeback: "Chargeback",
};

const PAYMENT_STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
  refunded: "outline",
  chargeback: "destructive",
};

function formatBRL(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

interface ManageSubscriptionClientProps {
  clinicName: string;
  subscription: {
    asaas_subscription_id: string;
    billing_type: string;
    status: string;
  } | null;
  payments: PlanPayment[];
}

export function ManageSubscriptionClient({
  clinicName,
  subscription,
  payments,
}: ManageSubscriptionClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [pixPayment, setPixPayment] = useState<PlanPayment | null>(null);
  const [pixData, setPixData] = useState<{ pixQrCode: string; pixPayload: string } | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixPaid, setPixPaid] = useState(false);

  async function openPix(payment: PlanPayment) {
    setPixPayment(payment);
    setPixData(null);
    setPixError(null);
    setPixPaid(false);
    setPixLoading(true);
    const data = await getPlanPaymentPix(payment.id);
    if (data && data.pixQrCode) {
      setPixData(data);
    } else {
      setPixError("Não foi possível carregar o PIX. Tente novamente em instantes.");
    }
    setPixLoading(false);
  }

  function closePix() {
    setPixPayment(null);
    setPixData(null);
    setPixError(null);
    setPixPaid(false);
    router.refresh();
  }

  // Enquanto o modal do PIX está aberto, verifica se o pagamento foi confirmado
  // (via webhook) para trocar o QR por uma tela de sucesso.
  useEffect(() => {
    if (!pixPayment || pixPaid) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      const clinic = await manageGetClinic();
      const updated = clinic?.payments.find((p) => p.id === pixPayment.id);
      if (!cancelled && updated?.status === "paid") {
        setPixPaid(true);
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pixPayment, pixPaid]);

  const billingTypeLabel =
    subscription?.billing_type === "PIX"
      ? "PIX"
      : subscription?.billing_type === "CREDIT_CARD"
        ? "Cartão de Crédito"
        : (subscription?.billing_type ?? "—");

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
        : subscription?.status === "canceled"
          ? "outline"
          : "outline";

  async function handleCancel() {
    if (
      !confirm(
        "Tem certeza que deseja cancelar? A cobrança será encerrada, mas você mantém acesso aos recursos pagos até o fim do ciclo vigente. Depois, o plano será rebaixado para Gratuito."
      )
    )
      return;
    setCancelling(true);
    try {
      const res = await fetch("/asaas/plans/cancel/", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Assinatura cancelada com sucesso!");
        router.refresh();
      } else {
        toast.error(data.error ?? "Erro ao cancelar");
      }
    } catch {
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">Detalhes da sua assinatura ASAAS.</p>
        </div>
      </div>

      {!subscription ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Nenhuma assinatura ativa</p>
            <p className="text-sm text-muted-foreground">
              Você ainda não possui uma assinatura ASAAS ativa.
            </p>
            <Button onClick={() => router.push("/plan")}>Ver planos</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscription.billing_type === "PIX" ? (
                <QrCode className="h-5 w-5" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              Assinatura ASAAS
            </CardTitle>
            <CardDescription>
              Gerencie sua assinatura de plano diretamente pelo ASAAS.
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
                <p className="text-xs text-muted-foreground">Método</p>
                <p className="font-medium">{billingTypeLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ID Assinatura</p>
                <p className="font-mono text-xs">{subscription.asaas_subscription_id}</p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">Trocar forma de pagamento</p>
              <p className="mt-1">
                Para mudar entre PIX e cartão, cancele a assinatura atual e assine novamente
                escolhendo o novo método. Em caso de dúvidas, fale com o suporte.
              </p>
            </div>

            {payments.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-medium">
                  <History className="h-4 w-4" />
                  Histórico de Pagamentos
                </h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
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
                          <TableCell className="text-sm">
                            {p.payment_method === "PIX"
                              ? "PIX"
                              : p.payment_method === "CREDIT_CARD"
                                ? "Cartão"
                                : p.payment_method || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                PAYMENT_STATUS_VARIANTS[p.status] ?? "outline"
                              }
                            >
                              {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {(p.status === "pending" || p.status === "overdue") &&
                            (p.payment_method === "PIX" ||
                              subscription?.billing_type === "PIX") ? (
                              <Button variant="outline" size="sm" onClick={() => openPix(p)}>
                                <QrCode className="mr-1 h-3 w-3" />
                                Pagar
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

            {subscription.status === "active" && (
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

      <Dialog
        open={!!pixPayment}
        onOpenChange={(open) => {
          if (!open) closePix();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar via PIX</DialogTitle>
            <DialogDescription>
              {pixPayment ? `Cobrança de ${formatBRL(pixPayment.amount)}` : ""}
            </DialogDescription>
          </DialogHeader>

          {pixPaid ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <div>
                <p className="text-lg font-semibold">Pagamento confirmado!</p>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura está em dia.
                </p>
              </div>
              <Button className="w-full" onClick={closePix}>
                Concluir
              </Button>
            </div>
          ) : pixLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando PIX…
            </div>
          ) : pixError ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {pixError}
            </div>
          ) : pixData ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${pixData.pixQrCode}`}
                  alt="QR Code PIX"
                  className="h-48 w-48"
                />
              </div>
              {pixData.pixPayload && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Código PIX (copia e cola)</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border bg-muted px-3 py-2 font-mono text-xs"
                      value={pixData.pixPayload}
                      readOnly
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.pixPayload);
                        toast.success("Código PIX copiado!");
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Aguardando confirmação do pagamento…
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
