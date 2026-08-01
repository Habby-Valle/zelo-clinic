"use client";

import { CheckCircle2, Mail, Phone, User, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaregiver } from "../hooks";

interface Props {
  caregiverId: string;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const [year, month, day] = value.split("T")[0].split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}

export function CaregiverDetailCard({ caregiverId }: Props) {
  const { data: caregiver, isLoading } = useCaregiver(caregiverId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!caregiver) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {caregiver.name}
        </CardTitle>
        <CardDescription>Dados do cuidador vinculado à clínica.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={caregiver.is_active ? "secondary" : "outline"} className="gap-1">
            {caregiver.is_active ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <span className="text-muted-foreground">•</span>
            )}
            {caregiver.is_active ? "Ativo" : "Inativo"}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {caregiver.patient_count} {caregiver.patient_count === 1 ? "paciente" : "pacientes"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailRow label="Email" value={caregiver.email} />
          <DetailRow label="Telefone" value={caregiver.phone || "—"} />
          <DetailRow
            label="Registro profissional"
            value={caregiver.professional_register || "—"}
          />
          <DetailRow label="Especialização" value={caregiver.specialization || "—"} />
          <DetailRow
            label="Data de nascimento"
            value={caregiver.birth_date ? formatDate(caregiver.birth_date) : "—"}
          />
          <DetailRow
            label="Gênero"
            value={caregiver.gender ? GENDER_LABELS[caregiver.gender] || caregiver.gender : "—"}
          />
          <DetailRow
            label="CPF"
            value={caregiver.cpf ? <span className="font-mono text-xs">{caregiver.cpf}</span> : "—"}
          />
          <DetailRow label="Cadastrado em" value={formatDate(caregiver.created_at)} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" /> {caregiver.email}
          </span>
          {caregiver.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {caregiver.phone}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
