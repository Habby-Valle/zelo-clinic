"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { PatientForm, useCreatePatient } from "@/features/patients"
import type { PatientFormValues } from "@/features/patients"

export default function NewPatientPage() {
  const router = useRouter()
  const createPatient = useCreatePatient()

  function onSubmit(values: PatientFormValues) {
    const body: Record<string, unknown> = {
      ...values,
      email: values.email || null,
      cpf: values.cpf || null,
    }
    createPatient.mutate(body, {
      onSuccess: (patient) => {
        router.push(`/patients/${patient.id}`)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/patients"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Paciente</h1>
          <p className="mt-1 text-muted-foreground">
            Cadastre um novo paciente na clínica.
          </p>
        </div>
      </div>

      <PatientForm
        onSubmit={onSubmit}
        isPending={createPatient.isPending}
        error={createPatient.error?.message ?? null}
        submitLabel="Cadastrar Paciente"
      />
    </div>
  )
}
