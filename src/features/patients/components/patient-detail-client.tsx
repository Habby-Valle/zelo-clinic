"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, Users } from "lucide-react";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  usePatient,
  useClinicCaregivers,
  useAssignCaregivers,
  useTogglePatientStatus,
} from "../hooks";
import { CarePlanSection } from "@/features/care-plans/components/care-plan-section";
import { useAuthStore } from "@/store/authStore";
import { HealthAlertsSection } from "@/features/health-alerts/components/health-alerts-section";

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = parseLocalDate(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return parseLocalDate(dateStr).toLocaleDateString("pt-BR");
  }
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PatientDetailClientProps {
  id: string;
}

export function PatientDetailClient({ id }: PatientDetailClientProps) {
  const { data: patient, isLoading: patientLoading } = usePatient(id);
  const { data: allCaregivers = [] } = useClinicCaregivers();

  const assignCaregivers = useAssignCaregivers(id);
  const toggleStatus = useTogglePatientStatus(id);
  // Enfermeiro: acesso somente leitura ao cadastro do paciente.
  const isNurse = useAuthStore((s) => s.user?.role === "clinic_nurse");

  const [selectedCaregivers, setSelectedCaregivers] = useState<string[]>([]);
  const [caregiverMsg, setCaregiverMsg] = useState<string | null>(null);

  useEffect(() => {
    if (patient?.caregiver_assignments) {
      startTransition(() => {
        setSelectedCaregivers(patient.caregiver_assignments.map((a) => String(a.caregiver_id)));
      });
    }
  }, [patient]);

  function toggleCaregiver(cgId: string) {
    setSelectedCaregivers((prev) =>
      prev.includes(cgId) ? prev.filter((c) => c !== cgId) : [...prev, cgId]
    );
  }

  function handleSaveCaregivers() {
    if (!patient) return;
    setCaregiverMsg(null);
    assignCaregivers.mutate(
      {
        caregiverIds: selectedCaregivers,
        currentAssignments: patient.caregiver_assignments,
      },
      {
        onSuccess: () => setCaregiverMsg("Vínculos salvos com sucesso!"),
        onError: (err) => setCaregiverMsg(err instanceof Error ? err.message : "Erro ao salvar"),
      }
    );
  }

  if (patientLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/patients" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-muted-foreground">Paciente não encontrado.</p>
      </div>
    );
  }

  const isActive = patient.is_active;
  const emergencyContacts = patient.emergency_contacts ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-1 items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={patient.media?.url ?? patient.photo_url ?? undefined}
              alt={patient.name}
            />
            <AvatarFallback className="text-base">{getInitials(patient.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{patient.name}</h1>
              {!isActive && <Badge variant="secondary">Inativo</Badge>}
            </div>
            <p className="text-muted-foreground">Detalhes do paciente</p>
          </div>
        </div>
        {!isNurse && (
          <div className="flex gap-2">
            {isActive ? (
              <Button
                variant="outline"
                disabled={toggleStatus.isPending}
                onClick={() => toggleStatus.mutate(false)}
              >
                {toggleStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Desativar
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled={toggleStatus.isPending}
                onClick={() => toggleStatus.mutate(true)}
              >
                {toggleStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reativar
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Dados do paciente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p>{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Idade</p>
                <p>{calculateAge(patient.birth_date)} anos</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                <p>{formatDate(patient.birth_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                <p>{formatDate(patient.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saúde</CardTitle>
            <CardDescription>Informações clínicas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Condições:</span> {patient.health_conditions || "—"}
            </div>
            <div>
              <span className="font-medium">Alergias:</span> {patient.allergies || "—"}
            </div>
            <div>
              <span className="font-medium">Medicamentos:</span> {patient.medications || "—"}
            </div>
            <div>
              <span className="font-medium">Tipo sanguíneo:</span> {patient.blood_type || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plano de Cuidado — montado pelo admin; enfermeiro revisa em Planos de Cuidado */}
      {!isNurse && (
        <CarePlanSection
          patientId={id}
          healthStatus={patient.health_status}
          healthConditions={patient.health_conditions}
          medications={patient.medications}
        />
      )}

      {/* Alertas de Saúde */}
      <HealthAlertsSection patientId={id} />

      {/* Familiares Vinculados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Familiares Vinculados
          </CardTitle>
          <CardDescription>Familiares que acompanham este paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          {emergencyContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum familiar vinculado.</p>
          ) : (
            <div className="space-y-2">
              {emergencyContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.profile_family_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPhone(c.profile_family_phone)} · Prioridade {c.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cuidadores — atribuição é ação do admin */}
      {!isNurse && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cuidadores Vinculados
          </CardTitle>
          <CardDescription>Selecione os cuidadores que atendem este paciente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allCaregivers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum cuidador cadastrado na clínica.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {allCaregivers.map((cg) => {
                const isSelected = selectedCaregivers.includes(cg.id);
                return (
                  <label
                    key={cg.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent ${
                      isSelected ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleCaregiver(cg.id)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cg.name}</p>
                      <p className="text-xs text-muted-foreground">{cg.email}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveCaregivers} disabled={assignCaregivers.isPending}>
              {assignCaregivers.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar vínculos
            </Button>
            {caregiverMsg && (
              <Alert
                variant={caregiverMsg.includes("sucesso") ? "default" : "destructive"}
                className="flex-1 py-2"
              >
                <AlertDescription>{caregiverMsg}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
