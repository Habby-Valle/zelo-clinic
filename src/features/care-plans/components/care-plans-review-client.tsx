"use client";

import { useState } from "react";
import { CheckCircle, ClipboardList, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useApproveCarePlan,
  useCarePlansForReview,
  useReturnCarePlan,
} from "../hooks/use-care-plans";

export function CarePlansReviewClient() {
  const { data: plans = [], isLoading } = useCarePlansForReview();
  const approve = useApproveCarePlan();
  const returnPlan = useReturnCarePlan();

  const [returnFor, setReturnFor] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function handleApprove(id: string) {
    try {
      await approve.mutateAsync(id);
      toast.success("Plano aprovado e ativado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar plano.");
    }
  }

  async function handleReturn() {
    if (!returnFor || !note.trim()) return;
    try {
      await returnPlan.mutateAsync({ planId: returnFor, note: note.trim() });
      toast.success("Plano devolvido à clínica.");
      setReturnFor(null);
      setNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao devolver plano.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos de Cuidado</h1>
        <p className="text-muted-foreground">
          Revise os planos enviados pela clínica e aprove ou devolva.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium">Nenhum plano aguardando revisão</p>
          <p className="text-sm text-muted-foreground">
            Os planos enviados pela clínica aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  {plan.patient_name}
                  <Badge variant="secondary">Em revisão</Badge>
                </CardTitle>
                {plan.responsible_name && (
                  <p className="text-sm text-muted-foreground">
                    Responsável indicado: {plan.responsible_name}
                    {plan.responsible_register ? ` (${plan.responsible_register})` : ""}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Checklists propostos</p>
                  {plan.checklists.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum checklist.</p>
                  ) : (
                    plan.checklists.map((c) => (
                      <div key={c.id} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-sm font-medium">{c.checklist_name}</span>
                          {c.checklist_category && c.checklist_category !== "general" && (
                            <Badge variant="outline" className="text-xs">
                              {c.checklist_category}
                            </Badge>
                          )}
                        </div>
                        {c.checklist_items.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sem itens.</p>
                        ) : (
                          <ul className="space-y-1">
                            {c.checklist_items.map((it) => (
                              <li
                                key={it.id}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                                <span>{it.name}</span>
                                {it.required && (
                                  <span className="text-xs text-destructive">obrigatório</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReturnFor(plan.id);
                      setNote("");
                    }}
                    disabled={approve.isPending || returnPlan.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Devolver
                  </Button>
                  <Button
                    onClick={() => handleApprove(plan.id)}
                    disabled={approve.isPending || returnPlan.isPending}
                  >
                    {approve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!returnFor} onOpenChange={(o) => !o && setReturnFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver plano</DialogTitle>
            <DialogDescription>
              Explique o que precisa ser corrigido. A clínica verá o motivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="return-note">Motivo</Label>
            <Textarea
              id="return-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Ex.: incluir checklist de sinais vitais; remover..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnFor(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReturn}
              disabled={returnPlan.isPending || !note.trim()}
            >
              {returnPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Devolver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
