"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, ClipboardList, Plus, Sparkles, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCaregiverMatch,
  useSubmitCarePlan,
  useCaregiverOptionsForPlan,
  useCarePlan,
  useChecklistOptionsForPlan,
  useSaveCarePlan,
} from "../hooks/use-care-plans";
import type { CaregiverOption } from "../types";
import { CARE_PLAN_STATUS_LABELS, type CarePlanStatus } from "../types";

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

const MOBILITY_KEYWORDS = [
  "acamad",
  "mobilidad",
  "avc",
  "cadeira de rodas",
  "deambul",
  "locomo",
  "fratura",
  "prótese",
  "protese",
];

export function CarePlanSection({
  patientId,
  healthStatus,
  healthConditions,
  medications,
}: CarePlanSectionProps) {
  const { data: plan, isLoading } = useCarePlan(patientId);
  const { data: checklistOptions = [] } = useChecklistOptionsForPlan();
  const { data: caregivers = [] } = useCaregiverOptionsForPlan();
  const saveMutation = useSaveCarePlan(patientId, plan?.id);
  const submitMutation = useSubmitCarePlan(patientId);

  const [selected, setSelected] = useState<string[]>([]);
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleRegister, setResponsibleRegister] = useState("");
  const [respFocused, setRespFocused] = useState(false);
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);

  // Sugestão automática por categoria, com base no perfil do paciente.
  // Baseline: sinais vitais + higiene. O profissional confirma/ajusta e aprova.
  const suggestedIds = useMemo(() => {
    const wanted = new Set<string>(["vitals", "hygiene"]);
    if (medications.trim()) wanted.add("medication");
    const conditions = healthConditions.toLowerCase();
    if (MOBILITY_KEYWORDS.some((k) => conditions.includes(k))) wanted.add("mobility");
    return checklistOptions.filter((c) => wanted.has(c.category)).map((c) => c.id);
  }, [checklistOptions, medications, healthConditions]);

  const respSuggestions = useMemo(() => {
    const q = responsibleName.trim().toLowerCase();
    if (!q) return [];
    const matches = caregivers.filter((c) => c.name.toLowerCase().includes(q));
    if (matches.length === 1 && matches[0].name.toLowerCase() === q) return [];
    return matches.slice(0, 6);
  }, [caregivers, responsibleName]);

  function selectCaregiver(c: CaregiverOption) {
    setResponsibleName(c.name);
    setResponsibleRegister(c.register);
    setRespFocused(false);
  }

  useEffect(() => {
    if (plan) {
      setSelected(plan.checklists.map((c) => c.checklist_id));
      setResponsibleName(plan.responsible_name);
      setResponsibleRegister(plan.responsible_register);
      setSuggestionsApplied(true); // não sobrepõe um plano já existente
    }
  }, [plan]);

  useEffect(() => {
    // Sem plano ainda: pré-seleciona as sugestões (uma vez).
    if (!suggestionsApplied && !isLoading && !plan && checklistOptions.length > 0) {
      setSelected(suggestedIds);
      setSuggestionsApplied(true);
    }
  }, [suggestionsApplied, isLoading, plan, checklistOptions, suggestedIds]);

  const showSuggestionHint = !plan && suggestedIds.length > 0;

  const isValidated = healthStatus === "validated";
  const isActive = plan?.status === "active";

  const buildInput = () => ({
    patient_id: patientId,
    responsible_name: responsibleName.trim(),
    responsible_register: responsibleRegister.trim(),
    checklists: selected.map((id) => ({ checklist_id: id })),
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

            <CaregiverMatchSection
              patientId={patientId}
              onSelect={selectCaregiver}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative space-y-1.5">
                <Label htmlFor="resp-name">Profissional responsável</Label>
                <Input
                  id="resp-name"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  onFocus={() => setRespFocused(true)}
                  onBlur={() => setRespFocused(false)}
                  placeholder="Buscar cuidador pelo nome"
                  autoComplete="off"
                />
                {respFocused && respSuggestions.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                    {respSuggestions.map((c) => (
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
              <div className="space-y-1.5">
                <Label htmlFor="resp-register">Registro (ex.: COREN)</Label>
                <Input
                  id="resp-register"
                  value={responsibleRegister}
                  onChange={(e) => setResponsibleRegister(e.target.value)}
                  placeholder="COREN-000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Checklists do plano</Label>
              {showSuggestionHint && (
                <p className="text-xs text-muted-foreground">
                  Pré-selecionados com base no perfil do paciente. Ajuste se necessário.
                </p>
              )}
              {checklistOptions.length === 0 ? (
                <div className="space-y-2 rounded-lg border border-dashed p-3">
                  <p className="text-xs text-muted-foreground">
                    Nenhum checklist disponível ainda. Crie um checklist para montar o plano.
                  </p>
                  <Link
                    href="/checklists"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Criar checklist
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5 rounded-lg border p-3">
                  {checklistOptions.map((cl) => (
                    <div key={cl.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`plan-cl-${cl.id}`}
                        checked={selected.includes(cl.id)}
                        onCheckedChange={(v) =>
                          setSelected((prev) =>
                            v === true ? [...prev, cl.id] : prev.filter((x) => x !== cl.id)
                          )
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
    </Card>
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
  const { data: matches, isLoading, isFetching } = useCaregiverMatch(
    enabled ? patientId : ""
  );

  return (
    <div className="rounded-lg border border-dashed p-4 space-y-3">
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
        <p className="text-xs text-muted-foreground animate-pulse">
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
        <p className="text-xs text-muted-foreground">
          Nenhum cuidador disponível encontrado.
        </p>
      )}
    </div>
  );
}
