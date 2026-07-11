"use client";

import { startTransition, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ChecklistDialog } from "@/features/checklists/components/checklist-dialog";
import type { ChecklistDetail } from "@/features/checklists/types";
import { ChecklistItemOverrideEditor } from "./checklist-item-override-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  useChecklistOptionsForPlan,
  useReturnCarePlan,
  useUpdateCarePlanChecklists,
} from "../hooks/use-care-plans";
import type { CarePlan, CarePlanChecklistOverride } from "../types";

// overrides[planId][checklistId][itemId] = override do item
type OverridesState = Record<
  string,
  Record<string, Record<string, CarePlanChecklistOverride>>
>;

export function CarePlansReviewClient() {
  const queryClient = useQueryClient();
  const { data: plans = [], isLoading } = useCarePlansForReview();
  const { data: checklistOptions = [] } = useChecklistOptionsForPlan();
  const approve = useApproveCarePlan();
  const returnPlan = useReturnCarePlan();
  const updateChecklists = useUpdateCarePlanChecklists();

  const [returnFor, setReturnFor] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [edits, setEdits] = useState<Record<string, string[]>>({});
  const [overrides, setOverrides] = useState<OverridesState>({});
  // expanded[planId] = checklistId aberto para ajuste de itens (um por plano).
  const [expanded, setExpanded] = useState<Record<string, string | null>>({});
  // Guarda o plano para o qual o checklist está sendo criado, para já marcá-lo.
  const [newChecklistFor, setNewChecklistFor] = useState<string | null>(null);

  // Inicializa overrides a partir dos planos carregados (uma vez por conjunto).
  useEffect(() => {
    const init: OverridesState = {};
    for (const plan of plans) {
      const byChecklist: Record<string, Record<string, CarePlanChecklistOverride>> = {};
      for (const cl of plan.checklists) {
        const byItem: Record<string, CarePlanChecklistOverride> = {};
        for (const ov of cl.overrides ?? []) byItem[ov.item_id] = ov;
        byChecklist[cl.checklist_id] = byItem;
      }
      init[plan.id] = byChecklist;
    }
    startTransition(() => setOverrides(init));
  }, [plans]);

  function itemOverridesFor(planId: string, checklistId: string) {
    return overrides[planId]?.[checklistId] ?? {};
  }

  function setItemOverride(
    planId: string,
    checklistId: string,
    itemId: string,
    override: CarePlanChecklistOverride
  ) {
    setOverrides((prev) => {
      const plan = { ...(prev[planId] ?? {}) };
      const checklist = { ...(plan[checklistId] ?? {}) };
      const existing = checklist[itemId] ?? { item_id: itemId };
      checklist[itemId] = { ...existing, ...override, item_id: itemId };
      plan[checklistId] = checklist;
      return { ...prev, [planId]: plan };
    });
  }

  function removeItemOverride(planId: string, checklistId: string, itemId: string) {
    setOverrides((prev) => {
      const plan = { ...(prev[planId] ?? {}) };
      const checklist = { ...(plan[checklistId] ?? {}) };
      delete checklist[itemId];
      plan[checklistId] = checklist;
      return { ...prev, [planId]: plan };
    });
  }

  function toggleExpanded(planId: string, checklistId: string) {
    setExpanded((prev) => ({
      ...prev,
      [planId]: prev[planId] === checklistId ? null : checklistId,
    }));
  }

  function handleChecklistCreated(created: ChecklistDetail) {
    queryClient.invalidateQueries({ queryKey: ["checklist-options-plan"] });
    const planId = newChecklistFor;
    if (!planId) return;
    const plan = plans.find((p) => p.id === planId);
    setEdits((prev) => {
      const current = prev[planId] ?? plan?.checklists.map((c) => c.checklist_id) ?? [];
      if (current.includes(created.id)) return prev;
      return { ...prev, [planId]: [...current, created.id] };
    });
  }

  const busy = approve.isPending || returnPlan.isPending || updateChecklists.isPending;

  function selectedFor(plan: CarePlan): string[] {
    return edits[plan.id] ?? plan.checklists.map((c) => c.checklist_id);
  }

  function toggle(plan: CarePlan, checklistId: string, checked: boolean) {
    setEdits((prev) => {
      const current = prev[plan.id] ?? plan.checklists.map((c) => c.checklist_id);
      const next = checked
        ? [...current, checklistId]
        : current.filter((id) => id !== checklistId);
      return { ...prev, [plan.id]: next };
    });
  }

  async function handleApprove(plan: CarePlan) {
    const selected = selectedFor(plan);
    if (selected.length === 0) return;
    const checklists = selected.map((cid) => {
      const byItem = overrides[plan.id]?.[cid] ?? {};
      const overrideList = Object.values(byItem).filter(
        (ov) =>
          ov.is_active === false ||
          ov.expected_min != null ||
          ov.expected_max != null ||
          ov.scheduled_times != null
      );
      return {
        checklist_id: cid,
        ...(overrideList.length > 0 ? { overrides: overrideList } : {}),
      };
    });
    try {
      // Persiste seleção + ajustes de itens do enfermeiro antes de aprovar.
      await updateChecklists.mutateAsync({ planId: plan.id, checklists });
      await approve.mutateAsync(plan.id);
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
          Revise os planos, ajuste os checklists se necessário, e aprove ou devolva.
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
          {plans.map((plan) => {
            const selected = selectedFor(plan);
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-base">
                    {plan.patient_name}
                    <Badge variant="secondary">Em revisão</Badge>
                  </CardTitle>
                  {plan.caregiver_name && (
                    <p className="text-sm text-muted-foreground">
                      Cuidador designado: {plan.caregiver_name}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Checklists do plano</p>
                    <p className="text-xs text-muted-foreground">
                      Marque os checklists adequados a este idoso. Faltando algum, crie em
                      Checklists.
                    </p>
                    {checklistOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum checklist disponível.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {checklistOptions.map((opt) => {
                          const checked = selected.includes(opt.id);
                          const isExpanded = expanded[plan.id] === opt.id;
                          const byItem = itemOverridesFor(plan.id, opt.id);
                          return (
                            <div key={opt.id} className="rounded-lg border p-3">
                              <div className="flex items-center gap-2">
                                <label className="flex flex-1 items-center gap-2">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => toggle(plan, opt.id, v === true)}
                                  />
                                  <span className="text-sm font-medium">{opt.name}</span>
                                  {opt.category && opt.category !== "general" && (
                                    <Badge variant="outline" className="text-xs">
                                      {opt.category}
                                    </Badge>
                                  )}
                                </label>
                                {checked && opt.items.length > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    aria-label={isExpanded ? "Ocultar ajustes" : "Ajustar itens"}
                                    onClick={() => toggleExpanded(plan.id, opt.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>

                              {!isExpanded && opt.items.length > 0 && (
                                <ul className="mt-2 space-y-1 pl-6">
                                  {opt.items.map((it) => {
                                    const isInactive = byItem[it.id]?.is_active === false;
                                    return (
                                      <li
                                        key={it.id}
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                      >
                                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                                        <span className={isInactive ? "line-through" : undefined}>
                                          {it.name}
                                        </span>
                                        {it.required && !isInactive && (
                                          <span className="text-xs text-destructive">
                                            obrigatório
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}

                              {checked && isExpanded && (
                                <div className="mt-2 space-y-2 pl-6">
                                  {opt.items.map((item) => (
                                    <ChecklistItemOverrideEditor
                                      key={item.id}
                                      item={item}
                                      override={byItem[item.id]}
                                      onSetOverride={(o) =>
                                        setItemOverride(plan.id, opt.id, item.id, o)
                                      }
                                      onRemoveOverride={() =>
                                        removeItemOverride(plan.id, opt.id, item.id)
                                      }
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewChecklistFor(plan.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Novo checklist
                    </Button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReturnFor(plan.id);
                        setNote("");
                      }}
                      disabled={busy}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Devolver
                    </Button>
                    <Button onClick={() => handleApprove(plan)} disabled={busy || selected.length === 0}>
                      {(approve.isPending || updateChecklists.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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

      <ChecklistDialog
        open={!!newChecklistFor}
        onOpenChange={(o) => !o && setNewChecklistFor(null)}
        onCreated={handleChecklistCreated}
      />
    </div>
  );
}
