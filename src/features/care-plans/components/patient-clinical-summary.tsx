"use client";

import { HeartPulse, Loader2 } from "lucide-react";
import { usePatient } from "@/features/patients/hooks";
import { PatientDocuments } from "@/features/patients/components/patient-documents";
import { DeclaredMedications } from "@/features/medications";

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Resumo clínico do paciente exibido na curadoria do plano, para o enfermeiro
 * saber de quem se trata (condições, alergias, medicações declaradas, receitas).
 */
export function PatientClinicalSummary({ patientId }: { patientId: string }) {
  const { data: patient, isLoading } = usePatient(patientId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando dados do paciente...
      </div>
    );
  }
  if (!patient) return null;

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <HeartPulse className="h-4 w-4 text-muted-foreground" />
        Quadro clínico
      </div>
      <p className="text-xs text-muted-foreground">
        {calculateAge(patient.birth_date)} anos · {GENDER_LABELS[patient.gender] ?? patient.gender}
        {patient.blood_type ? ` · ${patient.blood_type}` : ""}
      </p>
      <div>
        <span className="font-medium">Condições:</span> {patient.health_conditions || "—"}
      </div>
      <div>
        <span className={patient.allergies ? "font-medium text-destructive" : "font-medium"}>
          Alergias:
        </span>{" "}
        {patient.allergies || "—"}
      </div>
      <div>
        <span className="font-medium">Medicamentos:</span>
        <DeclaredMedications text={patient.medications} />
      </div>
      <div>
        <span className="font-medium">Receita médica:</span>
        <PatientDocuments documents={patient.documents.filter((d) => d.kind === "prescription")} />
      </div>
    </div>
  );
}
