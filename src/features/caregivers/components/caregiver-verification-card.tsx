"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XOctagon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaregiver, useVerifyCaregiver } from "../hooks";
import type { VerificationStatus } from "../types";

const STATUS_META: Record<
  VerificationStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }
> = {
  pending: { label: "Aguardando aprovação", variant: "outline", icon: Clock },
  approved: { label: "Aprovado", variant: "secondary", icon: CheckCircle2 },
  rejected: { label: "Rejeitado", variant: "destructive", icon: XOctagon },
};

interface Props {
  caregiverId: string;
}

export function CaregiverVerificationCard({ caregiverId }: Props) {
  const { data: caregiver, isLoading } = useCaregiver(caregiverId);
  const verify = useVerifyCaregiver(caregiverId);

  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!caregiver) return null;

  const status = (caregiver.verification_status ?? "pending") as VerificationStatus;
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  function handleAction(action: "approve" | "reject") {
    setError(null);
    if (action === "reject" && !note.trim()) {
      setError("Informe o motivo da rejeição.");
      return;
    }
    verify.mutate(
      { action, note: note.trim() },
      {
        onSuccess: () => setNote(""),
        onError: (err) => setError(err instanceof Error ? err.message : "Erro ao verificar"),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Verificação do cuidador
        </CardTitle>
        <CardDescription>
          Revise os documentos abaixo e aprove ou rejeite o cuidador. Só cuidadores aprovados podem
          ser escalados em turnos e vinculados a pacientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Badge variant={meta.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {meta.label}
          </Badge>
          {caregiver.verified_at && (
            <span className="text-xs text-muted-foreground">
              em {new Date(caregiver.verified_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>

        {status === "rejected" && caregiver.verification_note && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <span className="font-medium">Motivo da rejeição:</span> {caregiver.verification_note}
          </div>
        )}

        {status !== "approved" && (
          <div className="space-y-2">
            <Label htmlFor="verify-note">Observação {status === "pending" ? "(obrigatória p/ rejeitar)" : ""}</Label>
            <Textarea
              id="verify-note"
              placeholder="Ex.: falta enviar o ASO / registro profissional vencido."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          {status !== "approved" && (
            <Button onClick={() => handleAction("approve")} disabled={verify.isPending}>
              {verify.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprovar
            </Button>
          )}
          {status !== "rejected" && (
            <Button
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={verify.isPending}
            >
              <XOctagon className="mr-2 h-4 w-4" />
              Rejeitar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
