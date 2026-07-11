"use client";

import { useEffect, useMemo, useState, startTransition, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  ClipboardList,
  Plus,
  Sparkles,
  UserCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  useCaregiverMatch,
  useSubmitCarePlan,
  useCaregiverOptionsForPlan,
  useCarePlan,
  useChecklistOptionsForPlan,
  useChecklistSuggestions,
  useSaveCarePlan,
} from "../hooks/use-care-plans";
import type { CaregiverOption, CarePlanChecklistOverride, CarePlanChecklistItem, CarePlanGoal } from "../types";
import { CARE_PLAN_STATUS_LABELS, type CarePlanStatus } from "../types";
import { ChecklistDialog } from "@/features/checklists/components";
import type { ChecklistDetail } from "@/features/checklists/types";

const STATUS_VARIANTS: Record<CarePlanStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  pending_review: "secondary",
  active: "default",
  archived: "secondary",
};

interface CarePlanSectionProps {
  patientId: string;
  healthStatus: string;
  healthConditions: string;
  medications: string;
}

export function CarePlanSection({
  patientId,
  healthStatus,
  healthConditions,
  medications,
}: CarePlanSectionProps) {
  const queryClient = useQueryClient();
  const { data: plan, isLoading } = useCarePlan(patientId);
  const { data: checklistOptions = [] } = useChecklistOptionsForPlan();
  const { data: caregivers = [] } = useCaregiverOptionsForPlan();
  const { data: suggestions } = useChecklistSuggestions(patientId);
  const saveMutation = useSaveCarePlan(patientId, plan?.id);
  const submitMutation = useSubmitCarePlan(patientId);

  const [selected, setSelected] = useState<string[]>([]);
  const [caregiverId, setCaregiverId] = useState<string | null>(null);
  const [caregiverQuery, setCaregiverQuery] = useState("");
  const [caregiverFocused, setCaregiverFocused] = useState(false);
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [checklistDialogOpen, setChecklistDialogOpen] = useState(false);
  const [goals, setGoals] = useState<CarePlanGoal[]>([]);
  // overridesByChecklist[checklistId][itemId] = CarePlanChecklistOverride
  const [overridesByChecklist, setOverridesByChecklist] = useState<
    Record<string, Record<string, CarePlanChecklistOverride>>
  >({});

  // Inicializa overrides quando um plano é carregado
  useEffect(() => {
    if (!plan) return;
    const init: Record<string, Record<string, CarePlanChecklistOverride>> = {};
    for (const cl of plan.checklists) {
      const itemOverrides: Record<string, CarePlanChecklistOverride> = {};
      for (const ov of cl.overrides ?? []) {
        itemOverrides[ov.item_id] = ov;
      }
      init[cl.checklist_id] = itemOverrides;
    }
    startTransition(() => {
      setOverridesByChecklist(init);
      setGoals(plan.goals);
    });
  }, [plan]);

  function addGoal() {
    setGoals((prev) => [
      ...prev,
      { description: "", target_metric: "", order: prev.length },
    ]);
  }

  function removeGoal(index: number) {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }

  function updateGoal(index: number, field: keyof CarePlanGoal, value: string | number) {
    setGoals((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function getChecklistItemOverrides(checklistId: string): Record<string, CarePlanChecklistOverride> {
    return overridesByChecklist[checklistId] ?? {};
  }

  function setItemOverride(checklistId: string, itemId: string, override: CarePlanChecklistOverride) {
    setOverridesByChecklist((prev) => {
      const checklist = { ...(prev[checklistId] ?? {}) };
      const existing = checklist[itemId] ?? { item_id: itemId };
      checklist[itemId] = { ...existing, ...override, item_id: itemId };
      return { ...prev, [checklistId]: checklist };
    });
  }

  function removeItemOverride(checklistId: string, itemId: string) {
    setOverridesByChecklist((prev) => {
      const checklist = { ...(prev[checklistId] ?? {}) };
      delete checklist[itemId];
      return { ...prev, [checklistId]: checklist };
    });
  }

  function toggleChecklistExpanded(id: string) {
    setExpandedChecklist((prev) => (prev === id ? null : id));
  }

  // Checklist criado inline no plano: recarrega as opções e já o marca.
  function handleChecklistCreated(created: ChecklistDetail) {
    queryClient.invalidateQueries({ queryKey: ["checklist-options-plan"] });
    setSelected((prev) => (prev.includes(created.id) ? prev : [...prev, created.id]));
    setOverridesByChecklist((prev) =>
      prev[created.id] ? prev : { ...prev, [created.id]: {} }
    );
  }

  function handleSelectChecklist(checklistId: string, checked: boolean) {
    setSelected((prev) => {
      const next = checked ? [...prev, checklistId] : prev.filter((x) => x !== checklistId);
      if (!checked) {
        // limpa overrides ao desmarcar
        setOverridesByChecklist((prevOv) => {
          const copy = { ...prevOv };
          delete copy[checklistId];
          return copy;
        });
        if (expandedChecklist === checklistId) setExpandedChecklist(null);
      } else {
        // inicializa overrides vazios para os itens se não existirem
        const cl = checklistOptions.find((c) => c.id === checklistId);
        if (cl && !overridesByChecklist[checklistId]) {
          setOverridesByChecklist((prevOv) => ({
            ...prevOv,
            [checklistId]: {},
          }));
        }
      }
      return next;
    });
  }

  // Sugestão via API a partir dos diagnósticos do PatientAssessment.
  // Fallback: sinais vitais + higiene se a API não retornar sugestões.
  const suggestedIds = useMemo(() => {
    if (suggestions && suggestions.suggestions.length > 0) {
      return suggestions.suggestions.map((cl) => cl.id);
    }
    const wanted = new Set<string>(["vitals", "hygiene"]);
    if (medications.trim()) wanted.add("medication");
    const conditions = healthConditions.toLowerCase();
    const mobilityKw = ["acamad", "mobilidad", "avc", "cadeira", "deambul", "locomo", "fratura", "prótese", "protese"];
    if (mobilityKw.some((k) => conditions.includes(k))) wanted.add("mobility");
    return checklistOptions.filter((c) => wanted.has(c.category)).map((c) => c.id);
  }, [checklistOptions, medications, healthConditions, suggestions]);

  const caregiverSuggestions = useMemo(() => {
    const q = caregiverQuery.trim().toLowerCase();
    if (!q) return caregivers.slice(0, 6);
    const matches = caregivers.filter((c) => c.name.toLowerCase().includes(q));
    if (matches.length === 1 && matches[0].name.toLowerCase() === q) return [];
    return matches.slice(0, 6);
  }, [caregivers, caregiverQuery]);

  function selectCaregiver(c: CaregiverOption) {
    setCaregiverId(c.id);
    setCaregiverQuery(c.name);
    setCaregiverFocused(false);
  }

  useEffect(() => {
    if (plan) {
      startTransition(() => {
        setSelected(plan.checklists.map((c) => c.checklist_id));
        setCaregiverId(plan.caregiver_id);
        setCaregiverQuery(plan.caregiver_name ?? "");
        setSuggestionsApplied(true);
      });
    }
  }, [plan]);

  useEffect(() => {
    if (!suggestionsApplied && !isLoading && !plan && checklistOptions.length > 0) {
      startTransition(() => {
        setSelected(suggestedIds);
        setSuggestionsApplied(true);
      });
    }
  }, [suggestionsApplied, isLoading, plan, checklistOptions, suggestedIds]);

  const showSuggestionHint = !plan && suggestedIds.length > 0;
  const suggestionCategories = suggestions?.categories ?? [];

  const isValidated = healthStatus === "validated";
  const isActive = plan?.status === "active";

  const buildInput = () => ({
    patient_id: patientId,
    caregiver_id: caregiverId,
    checklists: selected.map((id) => {
      const itemOverrides = overridesByChecklist[id] ?? {};
      const overrideList = Object.values(itemOverrides).filter((ov) => {
        if (ov.is_active === false) return true;
        if (ov.expected_min != null) return true;
        if (ov.expected_max != null) return true;
        if (ov.scheduled_times != null) return true;
        return false;
      });
      return {
        checklist_id: id,
        ...(overrideList.length > 0 ? { overrides: overrideList } : {}),
      };
    }),
    goals: goals.map(({ description, target_metric, order }) => ({
      description,
      target_metric,
      order,
    })),
  });

  const canSubmit = selected.length > 0;

  async function handleSave() {
    try {
      await saveMutation.mutateAsync(buildInput());
      toast.success("Plano de cuidado salvo.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar plano.");
    }
  }

  async function handleSubmit() {
    try {
      const saved = await saveMutation.mutateAsync(buildInput());
      await submitMutation.mutateAsync(saved.id);
      toast.success("Plano enviado para revisão do enfermeiro.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar plano.");
    }
  }

  const busy = saveMutation.isPending || submitMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          Plano de Cuidado
          {plan && (
            <Badge variant={STATUS_VARIANTS[plan.status]}>
              {CARE_PLAN_STATUS_LABELS[plan.status]}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Define os checklists que o cuidador executa em cada turno deste paciente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isValidated ? (
          <p className="text-sm text-muted-foreground">
            Valide o cadastro de saúde do paciente para montar o plano de cuidado.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando plano...</p>
        ) : (
          <>
            {isActive && plan?.approved_by_name && (
              <p className="text-xs text-muted-foreground">
                Aprovado por {plan.approved_by_name}
                {plan.approved_at
                  ? ` em ${new Date(plan.approved_at).toLocaleDateString("pt-BR")}`
                  : ""}
                .
              </p>
            )}

            {plan?.status === "pending_review" && (
              <p className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
                Em revisão pelo enfermeiro. Você pode ajustar e reenviar.
              </p>
            )}

            {plan?.status === "draft" && plan.review_note && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                <p className="font-medium text-destructive">Devolvido pelo enfermeiro</p>
                <p className="mt-1 text-muted-foreground">{plan.review_note}</p>
              </div>
            )}

            <CaregiverMatchSection patientId={patientId} onSelect={selectCaregiver} />

            <div className="relative space-y-1.5">
              <Label htmlFor="plan-caregiver">Cuidador responsável</Label>
              <Input
                id="plan-caregiver"
                value={caregiverQuery}
                onChange={(e) => {
                  setCaregiverQuery(e.target.value);
                  setCaregiverId(null);
                }}
                onFocus={() => setCaregiverFocused(true)}
                onBlur={() => setCaregiverFocused(false)}
                placeholder="Buscar cuidador pelo nome"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                O cuidador escolhido será vinculado ao paciente quando o plano for
                aprovado pelo enfermeiro.
              </p>
              {caregiverFocused && caregiverSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                  {caregiverSuggestions.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectCaregiver(c);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <span>{c.name}</span>
                      {c.register && (
                        <span className="text-xs text-muted-foreground">{c.register}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Checklists do plano</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setChecklistDialogOpen(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Criar checklist
                </Button>
              </div>
              {showSuggestionHint && (
                <p className="text-xs text-muted-foreground">
                  Pré-selecionados com base {suggestionCategories.length > 0 ? `nos diagnósticos (${suggestionCategories.join(", ")})` : "no perfil do paciente"}
                  . Ajuste se necessário.
                </p>
              )}
              {checklistOptions.length === 0 ? (
                <div className="space-y-2 rounded-lg border border-dashed p-3">
                  <p className="text-xs text-muted-foreground">
                    Nenhum checklist disponível ainda. Crie um checklist para montar o plano.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setChecklistDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar checklist
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5 rounded-lg border p-3">
                  {checklistOptions.map((cl) => {
                    const checked = selected.includes(cl.id);
                    const itemOverrides = overridesByChecklist[cl.id] ?? {};
                    return (
                      <div key={cl.id}>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`plan-cl-${cl.id}`}
                            checked={checked}
                            onCheckedChange={(v) =>
                              handleSelectChecklist(cl.id, v === true)
                            }
                          />
                          <Label
                            htmlFor={`plan-cl-${cl.id}`}
                            className="flex-1 cursor-pointer text-sm font-normal"
                          >
                            {cl.name}
                          </Label>
                          {cl.category && cl.category !== "general" && (
                            <Badge variant="outline" className="text-xs">
                              {cl.category}
                            </Badge>
                          )}
                          {checked && cl.items.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              aria-label={
                                expandedChecklist === cl.id
                                  ? "Ocultar ajustes"
                                  : "Ajustar itens"
                              }
                              onClick={() => toggleChecklistExpanded(cl.id)}
                            >
                              {expandedChecklist === cl.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>

                        {checked && expandedChecklist !== cl.id && cl.items.length > 0 && (
                          <ul className="ml-6 mt-2 space-y-1 border-l-2 pl-3">
                            {cl.items.map((item) => {
                              const isInactive = itemOverrides[item.id]?.is_active === false;
                              return (
                                <li
                                  key={item.id}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                                  <span className={cn(isInactive && "line-through")}>
                                    {item.name}
                                  </span>
                                  {item.required && !isInactive && (
                                    <span className="text-[10px] text-destructive">
                                      obrigatório
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}

                        {checked && expandedChecklist === cl.id && (
                          <div className="ml-6 mt-2 space-y-2 border-l-2 pl-3">
                            {cl.items.map((item) => {
                              const ov = itemOverrides[item.id];
                              const isInactive = ov?.is_active === false;
                              return (
                                <div key={item.id} className="space-y-1.5 rounded-md border p-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                      <span className={cn("font-medium", isInactive && "text-muted-foreground line-through")}>
                                        {item.name}
                                      </span>
                                      <div className="mt-0.5 flex flex-wrap gap-1">
                                        <ItemMetaBadge item={item} />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Label className="text-[10px] text-muted-foreground">Inativo</Label>
                                      <Switch
                                        checked={!isInactive}
                                        onCheckedChange={(v) => {
                                          if (v) {
                                            removeItemOverride(cl.id, item.id);
                                          } else {
                                            setItemOverride(cl.id, item.id, {
                                              item_id: item.id,
                                              is_active: false,
                                            });
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {!isInactive && item.type === "number" && (
                                    <div className="mt-1 grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-[10px] text-muted-foreground">
                                          Min. esperado {item.unit ? `(${item.unit})` : ""}
                                        </Label>
                                        <Input
                                          className="h-7 text-xs"
                                          type="number"
                                          step="any"
                                          placeholder={item.expected_min?.toString() ?? "—"}
                                          value={ov?.expected_min?.toString() ?? ""}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setItemOverride(cl.id, item.id, {
                                              item_id: item.id,
                                              expected_min: v === "" ? null : Number(v),
                                            });
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label className="text-[10px] text-muted-foreground">
                                          Máx. esperado {item.unit ? `(${item.unit})` : ""}
                                        </Label>
                                        <Input
                                          className="h-7 text-xs"
                                          type="number"
                                          step="any"
                                          placeholder={item.expected_max?.toString() ?? "—"}
                                          value={ov?.expected_max?.toString() ?? ""}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setItemOverride(cl.id, item.id, {
                                              item_id: item.id,
                                              expected_max: v === "" ? null : Number(v),
                                            });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {!isInactive && item.frequency === "fixed_times" && (
                                    <div className="mt-1">
                                      <Label className="text-[10px] text-muted-foreground">
                                        Horários (separados por vírgula)
                                      </Label>
                                      <Input
                                        className="h-7 text-xs"
                                        value={(ov?.scheduled_times ?? item.scheduled_times).join(",")}
                                        onChange={(e) => {
                                          const times = e.target.value
                                            .split(",")
                                            .map((t) => t.trim())
                                            .filter(Boolean);
                                          setItemOverride(cl.id, item.id, {
                                            item_id: item.id,
                                            scheduled_times: times.length > 0 ? times : null,
                                          });
                                        }}
                                        placeholder={item.scheduled_times.join(",") || "08:00,14:00"}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Metas do Plano</Label>
                <Button type="button" variant="outline" size="sm" onClick={addGoal}>
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar meta
                </Button>
              </div>
              {goals.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma meta cadastrada. Adicione objetivos mensuráveis para o cuidado.
                </p>
              ) : (
                <div className="space-y-2 rounded-lg border p-3">
                  {goals.map((goal, index) => (
                    <div key={goal.id ?? index} className="space-y-2 rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Descrição</Label>
                          <textarea
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            rows={2}
                            value={goal.description}
                            onChange={(e) => updateGoal(index, "description", e.target.value)}
                            placeholder="Ex.: Reduzir a dor do paciente para nível leve"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeGoal(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Métrica alvo</Label>
                          <Input
                            className="h-8 text-xs"
                            value={goal.target_metric}
                            onChange={(e) => updateGoal(index, "target_metric", e.target.value)}
                            placeholder="Ex.: Escala de dor &lt; 3"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ordem</Label>
                          <Input
                            className="h-8 text-xs"
                            type="number"
                            value={goal.order}
                            onChange={(e) => updateGoal(index, "order", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isActive && (
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={handleSave} disabled={busy}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar rascunho
                </Button>
                <Button onClick={handleSubmit} disabled={busy || !canSubmit}>
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Enviar para revisão
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
      <ChecklistDialog
        open={checklistDialogOpen}
        onOpenChange={setChecklistDialogOpen}
        onCreated={handleChecklistCreated}
      />
    </Card>
  );
}

function ItemMetaBadge({ item }: { item: CarePlanChecklistItem }) {
  const labels: string[] = [];
  if (item.criticality === "high") labels.push("Alta");
  if (item.requires_photo) labels.push("Foto");
  if (item.type === "number" && item.unit) labels.push(item.unit);
  if (item.frequency === "fixed_times" && item.scheduled_times.length > 0) {
    labels.push(`${item.scheduled_times.length} horários`);
  }
  if (labels.length === 0) return null;
  return (
    <>
      {labels.map((l) => (
        <Badge key={l} variant="outline" className="text-[10px]">
          {l}
        </Badge>
      ))}
    </>
  );
}

function CaregiverMatchSection({
  patientId,
  onSelect,
}: {
  patientId: string;
  onSelect: (c: CaregiverOption) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const { data: matches, isLoading, isFetching } = useCaregiverMatch(enabled ? patientId : "");

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Cuidadores Recomendados
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEnabled(true)}
          disabled={isLoading}
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <UserCheck className="mr-2 h-3 w-3" />
          )}
          {isFetching ? "Buscando..." : "Buscar melhores cuidadores"}
        </Button>
      </div>

      {isLoading && (
        <p className="animate-pulse text-xs text-muted-foreground">
          Analisando cuidadores disponíveis...
        </p>
      )}

      {matches && matches.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Cuidador</th>
                <th className="px-3 py-2 text-center font-medium">Match</th>
                <th className="px-3 py-2 text-center font-medium">Qualidade</th>
                <th className="px-3 py-2 text-center font-medium">Disp.</th>
                <th className="px-3 py-2 text-center font-medium" />
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.caregiver_id} className="border-t hover:bg-accent/50">
                  <td className="px-3 py-2">
                    <div className="font-medium">{m.caregiver_name}</div>
                    {m.explanation && (
                      <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                        {m.explanation}
                      </div>
                    )}
                    {!m.explanation && m.specialization && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        {m.specialization}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge
                      variant={m.overall_score >= 70 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {m.overall_score}%
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-center text-muted-foreground">
                    {m.quality_score}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    {m.availability_score >= 100 ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        onSelect({
                          id: m.caregiver_id,
                          name: m.caregiver_name,
                          register: m.professional_register,
                        })
                      }
                    >
                      Selecionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {matches && matches.length === 0 && !isLoading && (
        <p className="text-xs text-muted-foreground">Nenhum cuidador disponível encontrado.</p>
      )}
    </div>
  );
}
