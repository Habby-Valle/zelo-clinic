"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreditCard, QrCode, AlertCircle, Loader2, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ManageSubscriptionClientProps {
  clinicName: string;
  subscription: {
    asaas_subscription_id: string;
    billing_type: string;
    status: string;
  } | null;
}

export function ManageSubscriptionClient({
  clinicName,
  subscription,
}: ManageSubscriptionClientProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

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
        "Tem certeza que deseja cancelar a assinatura? O plano será rebaixado para Gratuito."
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
              <p className="font-medium">Gerenciamento pelo ASAAS</p>
              <p className="mt-1">
                Para alterar método de pagamento, visualizar histórico completo ou atualizar dados,
                acesse o painel de controle do ASAAS.
              </p>
            </div>

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
    </div>
  );
}
