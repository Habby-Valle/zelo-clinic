"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type { PatientFormValues };

interface PatientFormProps {
  defaultValues?: Partial<PatientFormValues>;
  onSubmit: (values: PatientFormValues) => void;
  isPending?: boolean;
  error?: string | null;
  submitLabel?: string;
}

const GENDER_LABELS = { M: "Masculino", F: "Feminino", O: "Outro" };
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function PatientForm({
  defaultValues,
  onSubmit,
  isPending,
  error,
  submitLabel = "Salvar",
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(patientSchema) as any,
    defaultValues: {
      name: "",
      birth_date: "",
      gender: undefined,
      cpf: null,
      phone: "",
      email: null,
      blood_type: null,
      health_conditions: "",
      allergies: "",
      medications: "",
      observations: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dados básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              placeholder="Nome do paciente"
              disabled={isPending}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birth_date">Data de nascimento *</Label>
            <Input id="birth_date" type="date" disabled={isPending} {...register("birth_date")} />
            {errors.birth_date && (
              <p className="text-xs text-destructive">{errors.birth_date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Sexo *</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v ?? "")}>
                  <SelectTrigger disabled={isPending}>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GENDER_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              disabled={isPending}
              {...register("cpf")}
            />
            {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              disabled={isPending}
              {...register("phone")}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              disabled={isPending}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo sanguíneo</Label>
            <Controller
              name="blood_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange((v ?? "none") === "none" ? null : v)}
                >
                  <SelectTrigger disabled={isPending}>
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {BLOOD_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações de saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações de Saúde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="health_conditions">Condições de saúde</Label>
            <Textarea
              id="health_conditions"
              placeholder="Ex: Hipertensão, diabetes..."
              rows={3}
              disabled={isPending}
              {...register("health_conditions")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              placeholder="Ex: Penicilina, amendoim..."
              rows={3}
              disabled={isPending}
              {...register("allergies")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="medications">Medicamentos em uso</Label>
            <Textarea
              id="medications"
              placeholder="Ex: Losartana 50mg, Metformina 500mg..."
              rows={3}
              disabled={isPending}
              {...register("medications")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações gerais..."
              rows={3}
              disabled={isPending}
              {...register("observations")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
