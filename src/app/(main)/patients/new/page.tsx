"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PatientForm, useCreatePatient } from "@/features/patients";
import type { PatientFormValues } from "@/features/patients";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const createPatient = useCreatePatient();

  async function onSubmit(values: PatientFormValues) {
    try {
      await createPatient.mutateAsync({
        name: values.name,
        birth_date: values.birth_date,
        gender: values.gender,
        cpf: values.cpf || null,
        phone: values.phone,
        email: values.email || null,
        blood_type: values.blood_type ?? null,
        health_conditions: values.health_conditions ?? "",
        allergies: values.allergies ?? "",
        medications: values.medications ?? "",
        observations: values.observations ?? "",
      });
      toast.success("Paciente criado com sucesso");
      router.push("/patients");
    } catch {
      // error is set via createPatient.error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Paciente</h1>
          <p className="mt-1 text-muted-foreground">Cadastre um novo paciente na clínica.</p>
        </div>
      </div>

      <PatientForm
        onSubmit={onSubmit}
        isPending={createPatient.isPending}
        error={createPatient.error?.message ?? null}
        submitLabel="Cadastrar Paciente"
      />
    </div>
  );
}
