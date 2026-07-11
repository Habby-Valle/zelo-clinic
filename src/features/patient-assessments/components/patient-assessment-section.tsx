"use client";

import { useState } from "react";
import { Loader2, Plus, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import {
  useCreatePatientAssessment,
  usePatientAssessments,
} from "../hooks/use-patient-assessments";
import type { MobilityLevel } from "../types";
import { MOBILITY_LABELS } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface PatientAssessmentSectionProps {
  patientId: string;
  declaredConditions?: string;
}

export function PatientAssessmentSection({
  patientId,
  declaredConditions,
}: PatientAssessmentSectionProps) {
  const { data: assessments = [], isLoading } = usePatientAssessments(patientId);
  const createAssessment = useCreatePatientAssessment(patientId);

  const [showForm, setShowForm] = useState(!assessments.length);
  const [mobilityLevel, setMobilityLevel] = useState<MobilityLevel | "">("");
  const [fallRiskScore, setFallRiskScore] = useState("");
  const [pressureUlcerRisk, setPressureUlcerRisk] = useState("");
  // Pré-preenche os diagnósticos com as condições declaradas pela família.
  // Morse/Braden/mobilidade seguem manuais — exigem exame presencial.
  const [diagnoses, setDiagnoses] = useState(() =>
    (declaredConditions ?? "")
      .split(/[\n,;]+/)
      .map((d) => d.trim())
      .filter(Boolean)
      .join("\n")
  );
  const [notes, setNotes] = useState("");

  const latest = assessments[0];

  async function handleSubmit() {
    try {
      await createAssessment.mutateAsync({
        mobility_level: mobilityLevel,
        fall_risk_score: fallRiskScore ? Number(fallRiskScore) : null,
        pressure_ulcer_risk: pressureUlcerRisk ? Number(pressureUlcerRisk) : null,
        diagnoses: diagnoses
          ? diagnoses
              .split("\n")
              .map((d) => d.trim())
              .filter(Boolean)
          : [],
        notes,
      });
      toast.success("Avaliação registrada!");
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar avaliação");
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-muted-foreground" />
          Avaliação Clínica
          {latest && (
            <Badge variant="outline" className="text-xs">
              {new Date(latest.performed_at).toLocaleDateString("pt-BR")}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Avaliação clínica estruturada do paciente (Mobilidade, Riscos, Diagnósticos).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest && !showForm && (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Mobilidade</p>
                <p className="text-sm font-medium">{latest.mobility_display || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Risco de Queda (Morse)</p>
                <p className="text-sm font-medium">{latest.fall_risk_score ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Risco de Lesão (Braden)</p>
                <p className="text-sm font-medium">{latest.pressure_ulcer_risk ?? "—"}</p>
              </div>
            </div>
            {latest.diagnoses.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Diagnósticos</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {latest.diagnoses.map((d, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {latest.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Observações</p>
                <p className="text-sm text-muted-foreground">{latest.notes}</p>
              </div>
            )}
            {latest.performed_by_name && (
              <p className="text-xs text-muted-foreground">por {latest.performed_by_name}</p>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Nova avaliação
            </Button>
          </div>
        )}

        {showForm && (
          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-1.5">
              <Label>Nível de Mobilidade</Label>
              <Select
                value={mobilityLevel}
                onValueChange={(v) => setMobilityLevel(v as MobilityLevel | "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(MOBILITY_LABELS) as [MobilityLevel, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Risco de Queda (Morse 0-125)</Label>
                <Input
                  type="number"
                  min={0}
                  max={125}
                  value={fallRiskScore}
                  onChange={(e) => setFallRiskScore(e.target.value)}
                  placeholder="Ex: 45"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Risco de Lesão (Braden 6-23)</Label>
                <Input
                  type="number"
                  min={6}
                  max={23}
                  value={pressureUlcerRisk}
                  onChange={(e) => setPressureUlcerRisk(e.target.value)}
                  placeholder="Ex: 18"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Diagnósticos (um por linha)</Label>
              <Textarea
                value={diagnoses}
                onChange={(e) => setDiagnoses(e.target.value)}
                placeholder="Ex: Hipertensão arterial&#10;Diabetes tipo 2&#10;Risco de queda elevado"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações clínicas adicionais..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              {latest && (
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={createAssessment.isPending}
                >
                  Cancelar
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={createAssessment.isPending}>
                {createAssessment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                {latest ? "Nova avaliação" : "Registrar avaliação"}
              </Button>
            </div>
          </div>
        )}

        {!latest && !showForm && (
          <div className="space-y-2 rounded-lg border border-dashed p-4">
            <p className="text-sm text-muted-foreground">
              Nenhuma avaliação registrada. A avaliação clínica é necessária antes de ativar o plano
              de cuidado.
            </p>
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar avaliação
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
