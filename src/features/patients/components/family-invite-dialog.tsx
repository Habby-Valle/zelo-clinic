"use client";

import { useState } from "react";
import { Loader2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useInviteFamily, useGenerateFamilyLinkCode, usePendingInvites } from "../hooks";
import type { PendingInvite } from "../types";

interface FamilyInviteDialogProps {
  patientId: string;
  clinicId: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  expired: "Expirado",
  cancelled: "Cancelado",
};

export function FamilyInviteDialog({ patientId, clinicId }: FamilyInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [codeEmail, setCodeEmail] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeResult, setCodeResult] = useState<{ code: string; email: string } | null>(null);

  const inviteFamily = useInviteFamily(patientId);
  const generateLinkCode = useGenerateFamilyLinkCode();
  const { data: pendingInvites = [] } = usePendingInvites(patientId);

  function reset() {
    setInviteEmail("");
    setInviteError(null);
    setCodeEmail("");
    setCodeError(null);
    setCodeResult(null);
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    if (!clinicId) {
      setInviteError("Clínica não identificada. Faça login novamente.");
      return;
    }
    setInviteError(null);
    inviteFamily.mutate(
      { clinicId, email: inviteEmail.trim() },
      {
        onSuccess: () => {
          setInviteEmail("");
          toast.success("Convite enviado por email.");
        },
        onError: (err) =>
          setInviteError(err instanceof Error ? err.message : "Erro ao enviar convite"),
      }
    );
  }

  function handleGenerateCode(e: React.FormEvent) {
    e.preventDefault();
    if (!codeEmail.trim()) return;
    setCodeError(null);
    setCodeResult(null);
    generateLinkCode.mutate(codeEmail.trim(), {
      onSuccess: (data) => {
        setCodeResult({ code: data.code, email: data.email });
      },
      onError: (err) => setCodeError(err instanceof Error ? err.message : "Erro ao gerar código"),
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        Convidar Familiar
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Convidar Familiar</DialogTitle>
            <DialogDescription>
              Convide um familiar para acompanhar este paciente. Ele receberá um link ou código para
              acessar o Zelo e cadastrar o paciente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pendingInvites.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Convites pendentes</p>
                <ul className="space-y-1.5">
                  {pendingInvites.map((invite: PendingInvite) => (
                    <li key={invite.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{invite.email}</span>
                      <Badge variant="outline">
                        {STATUS_LABELS[invite.status] ?? invite.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3">
              {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
              <div className="space-y-1.5">
                <Label htmlFor="family-invite-email">Email do familiar *</Label>
                <Input
                  id="family-invite-email"
                  type="email"
                  placeholder="familiar@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteFamily.isPending}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={inviteFamily.isPending}>
                  {inviteFamily.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Convite
                </Button>
              </div>
            </form>

            <div className="border-t pt-4">
              {codeResult ? (
                <div className="rounded-lg border bg-muted/30 p-6 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">Código gerado para</p>
                  <p className="mb-4 font-medium">{codeResult.email}</p>
                  <div className="inline-block rounded-md bg-primary/5 px-8 py-4">
                    <span className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">
                      {codeResult.code}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Um email com este código foi enviado ao familiar.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleGenerateCode} className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Ou gere um código para um familiar que já possui conta:
                  </p>
                  {codeError && <p className="text-sm text-destructive">{codeError}</p>}
                  <div className="space-y-1.5">
                    <Label htmlFor="family-code-email">Email do familiar *</Label>
                    <Input
                      id="family-code-email"
                      type="email"
                      placeholder="familiar@exemplo.com"
                      value={codeEmail}
                      onChange={(e) => setCodeEmail(e.target.value)}
                      disabled={generateLinkCode.isPending}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" variant="outline" disabled={generateLinkCode.isPending}>
                      {generateLinkCode.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Gerar Código
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <XCircle className="mr-2 h-4 w-4" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
