"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2, Pill, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientDocuments } from "@/features/patients/components/patient-documents";
import type { PatientDocument } from "@/features/patients/types";
import {
  useMedications,
  useMedicationSuggestions,
  useCreateMedication,
  useUpdateMedication,
  useDeleteMedication,
} from "../hooks/use-medications";
import type { Medication, MedicationSuggestion, SaveMedicationInput } from "../types";
import { MEDICATION_ROUTE_LABELS, type MedicationRoute } from "../types";
import { parseDeclaredMedications } from "../lib/parse-declared";
import { parseDeclaredMedicationDetails } from "../lib/parse-declared-detail";

interface MedicationSectionProps {
  patientId: string;
  declaredMedications?: string;
  prescriptions?: PatientDocument[];
}

// Horário-padrão sugerido quando a família declara só o turno (sem HH:MM).
const TURN_DEFAULT_TIME: Record<string, string> = {
  Manhã: "08:00",
  Tarde: "14:00",
  Noite: "20:00",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): SaveMedicationInput {
  return {
    name: "",
    dose: "",
    route: "oral",
    schedule_times: [],
    prescribed_by: "",
    notes: "",
    is_active: true,
    start_date: today(),
    end_date: null,
  };
}

export function MedicationSection({
  patientId,
  declaredMedications,
  prescriptions = [],
}: MedicationSectionProps) {
  const { data: medications = [], isLoading } = useMedications(patientId);
  const createMutation = useCreateMedication(patientId);
  const updateMutation = useUpdateMedication(patientId);
  const deleteMutation = useDeleteMedication(patientId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SaveMedicationInput>(emptyForm());
  const [timesCsv, setTimesCsv] = useState("");
  // Uso contínuo = sem data de término (end_date nulo).
  const [continuous, setContinuous] = useState(true);
  const [showReceita, setShowReceita] = useState(false);

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // Sugestões de NOME extraídas do texto declarado pela família. Só aparecem
  // enquanto não há medicação cadastrada, para não duplicar o que já foi revisado.
  // A IA (backend) só sugere nomes; se indisponível, cai no parser heurístico local.
  const canSuggest = medications.length === 0 && !!declaredMedications?.trim();
  const { data: aiSuggestions } = useMedicationSuggestions(patientId, canSuggest);
  const suggestions: MedicationSuggestion[] = canSuggest
    ? aiSuggestions?.length
      ? aiSuggestions
      : parseDeclaredMedications(declaredMedications ?? "")
    : [];

  function applySuggestion(s: MedicationSuggestion) {
    // Pré-preenche com o que a família declarou (nome, dose, horários) como
    // rascunho — a enfermeira confere/ajusta na receita antes de salvar.
    // Match tolerante: a sugestão pode carregar a dose no nome ("Nome (50mg)"),
    // então normaliza removendo parênteses; cai para o trecho de origem.
    const norm = (x: string) =>
      x.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const details = parseDeclaredMedicationDetails(declaredMedications ?? "");
    const target = norm(s.name);
    const detail =
      details.find((d) => norm(d.name) === target) ??
      details.find((d) => (s.source_text ?? "").toLowerCase().includes(d.name.toLowerCase()));
    const times = detail?.times.length
      ? detail.times
      : (detail?.turns ?? [])
          .map((t) => TURN_DEFAULT_TIME[t])
          .filter(Boolean);
    setForm({
      ...emptyForm(),
      name: s.name,
      dose: detail?.dose ?? "",
      schedule_times: times,
      notes: `Declarado pela família: "${s.source_text}" — validar dose e via na receita.`,
    });
    setTimesCsv(times.join(","));
    setContinuous(true);
    setShowForm(true);
  }

  function resetForm() {
    setForm(emptyForm());
    setTimesCsv("");
    setContinuous(true);
    setShowForm(false);
  }

  async function handleCreate() {
    if (!form.name.trim()) {
      toast.error("Nome da medicação é obrigatório.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        ...form,
        end_date: continuous ? null : form.end_date,
        schedule_times: timesCsv
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Medicação adicionada.");
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar medicação.");
    }
  }

  async function handleToggleActive(med: Medication) {
    try {
      await updateMutation.mutateAsync({
        medId: med.id,
        input: { is_active: !med.is_active },
      });
      toast.success(med.is_active ? "Medicação desativada." : "Medicação ativada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
  }

  async function handleDelete(med: Medication) {
    try {
      await deleteMutation.mutateAsync(med.id);
      toast.success("Medicação removida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-muted-foreground" />
              Medicações
            </CardTitle>
            <CardDescription>
              Medicações prescritas e horários de administração (MAR).
            </CardDescription>
          </div>
          {prescriptions.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowReceita(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Consultar receita
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : medications.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground">Nenhuma medicação cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {medications.map((med) => (
              <div key={med.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        med.is_active ? "font-medium" : "text-muted-foreground line-through"
                      }
                    >
                      {med.name}
                    </span>
                    {med.dose && (
                      <Badge variant="secondary" className="text-[10px]">
                        {med.dose}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {med.route_display}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {med.schedule_times.length > 0 && <span>{med.schedule_times.join(", ")}</span>}
                    {med.prescribed_by && <span>· {med.prescribed_by}</span>}
                  </div>
                  {med.notes && <p className="text-xs text-muted-foreground">{med.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={med.is_active} onCheckedChange={() => handleToggleActive(med)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => handleDelete(med)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  className="h-8 text-xs"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex.: Metformina"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Dose</Label>
                <Input
                  className="h-8 text-xs"
                  value={form.dose}
                  onChange={(e) => setForm({ ...form, dose: e.target.value })}
                  placeholder="Ex.: 850mg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Via</Label>
                <Select
                  value={form.route}
                  onValueChange={(v) => setForm({ ...form, route: v as MedicationRoute })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MEDICATION_ROUTE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Prescrito por (da receita, se houver)</Label>
                <Input
                  className="h-8 text-xs"
                  value={form.prescribed_by}
                  onChange={(e) => setForm({ ...form, prescribed_by: e.target.value })}
                  placeholder="Ex.: Dr. Silva - CRM 12345"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Horários (separados por vírgula)</Label>
                <Input
                  className="h-8 text-xs"
                  value={timesCsv}
                  onChange={(e) => setTimesCsv(e.target.value)}
                  placeholder="Ex.: 08:00,14:00,20:00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Início da administração</Label>
                <Input
                  className="h-8 text-xs"
                  type="date"
                  value={form.start_date ?? ""}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value || null })}
                />
                <p className="text-[10px] text-muted-foreground">
                  Quando os cuidadores começam a administrar (não gera doses no passado).
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Término</Label>
                <Input
                  className="h-8 text-xs"
                  type="date"
                  value={form.end_date ?? ""}
                  disabled={continuous}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value || null })}
                />
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Checkbox
                    checked={continuous}
                    onCheckedChange={(v) => {
                      const on = v === true;
                      setContinuous(on);
                      if (on) setForm((f) => ({ ...f, end_date: null }));
                    }}
                  />
                  Uso contínuo (sem data de término)
                </label>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Observações</Label>
                <Input
                  className="h-8 text-xs"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observações sobre a medicação"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreate} disabled={busy}>
                {createMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {!showForm && suggestions.length > 0 && (
          <div className="rounded-lg border border-dashed p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Declarados pela família. Ao aplicar, nome, dose e horários vêm como rascunho —
              valide na receita antes de salvar.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => applySuggestion(s)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {s.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar medicação
          </Button>
        )}
      </CardContent>

      <Dialog open={showReceita} onOpenChange={setShowReceita}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Receita médica
            </DialogTitle>
          </DialogHeader>
          <PatientDocuments documents={prescriptions} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
