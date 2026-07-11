"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Loader2, Users, Calendar, Plus } from "lucide-react";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePatient, useClinicCaregivers, useTogglePatientStatus } from "../hooks";
import { CarePlanSection } from "@/features/care-plans/components/care-plan-section";
import { MedicationSection, DeclaredMedications } from "@/features/medications";
import { PatientDocuments } from "./patient-documents";
import { PatientRecordSection } from "./patient-record-section";
import { useAuthStore } from "@/store/authStore";
import { HealthAlertsSection } from "@/features/health-alerts/components/health-alerts-section";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createShift, createRecurringShifts } from "@/app/(main)/shifts/actions";
import {
  shiftDateTimes,
  shiftStartFromContract,
  WEEKDAY_LABELS,
} from "@/features/shifts/lib/shift-time";
import { ShiftMonthCalendar } from "@/features/shifts/components/shift-month-calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

  const toggleStatus = useTogglePatientStatus(id);
  // Enfermeiro: acesso somente leitura ao cadastro do paciente.
  const isNurse = useAuthStore((s) => s.user?.role === "clinic_nurse");

  // Aba ativa espelhada na URL (?tab=) — sobrevive a refresh e é compartilhável.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "overview";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
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

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clinical">Clínico</TabsTrigger>
          <TabsTrigger value="shifts">Turnos</TabsTrigger>
          <TabsTrigger value="record">Prontuário</TabsTrigger>
        </TabsList>

        {/* Visão Geral — cadastro, saúde declarada, vínculos */}
        <TabsContent value="overview" className="mt-6 space-y-6">
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
                  <span className="font-medium">Medicamentos:</span>
                  <DeclaredMedications text={patient.medications} />
                </div>
                <div>
                  <span className="font-medium">Tipo sanguíneo:</span> {patient.blood_type || "—"}
                </div>
                <div>
                  <span className="font-medium">Receita médica:</span>
                  <PatientDocuments
                    documents={patient.documents.filter((d) => d.kind === "prescription")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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

          {/* Cuidadores — vínculo definido na aprovação do plano de cuidado */}
          {!isNurse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Cuidadores
                </CardTitle>
                <CardDescription>
                  Cuidadores vinculados a este paciente. O vínculo é definido no plano de cuidado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patient.caregiver_assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum cuidador vinculado. Defina o cuidador responsável no plano de cuidado.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {patient.caregiver_assignments.map((a) => (
                      <div
                        key={a.caregiver_id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="text-sm font-medium">{a.caregiver_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Clínico — plano, medicações, alertas (Avaliação Clínica adiada no MVP) */}
        <TabsContent value="clinical" className="mt-6 space-y-6">
          {/* Plano de Cuidado — montado pelo admin; enfermeiro revisa em Planos de Cuidado */}
          {!isNurse && (
            <CarePlanSection
              patientId={id}
              healthStatus={patient.health_status}
              healthConditions={patient.health_conditions}
            />
          )}

          {/* Medicações (MAR) */}
          {!isNurse && (
            <MedicationSection
              patientId={id}
              declaredMedications={patient.medications}
              prescriptions={patient.documents.filter((d) => d.kind === "prescription")}
            />
          )}

          {/* Alertas de Saúde */}
          <HealthAlertsSection patientId={id} />
        </TabsContent>

        {/* Prontuário */}
        <TabsContent value="record" className="mt-6 space-y-6">
          <PatientRecordSection patientId={id} />
        </TabsContent>

        {/* Turnos */}
        <TabsContent value="shifts" className="mt-6 space-y-6">
          <PatientShiftsSection
            patientId={id}
            isNurse={isNurse}
            contractStartDate={patient.contract_start_date}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PatientShiftsSection({
  patientId,
  isNurse,
  contractStartDate,
}: {
  patientId: string;
  isNurse: boolean;
  contractStartDate: string | null;
}) {
  const queryClient = useQueryClient();
  const { data: allCaregivers = [] } = useClinicCaregivers();

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formCaregiver, setFormCaregiver] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("08:00");
  const [formEndTime, setFormEndTime] = useState("20:00");
  const [formNotes, setFormNotes] = useState("");
  const [formRepeat, setFormRepeat] = useState(false);
  const [formWeekdays, setFormWeekdays] = useState<number[]>([]);
  const [formRecurEnd, setFormRecurEnd] = useState("");

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["shifts"] });
  }, [queryClient]);

  function openCreate() {
    setCreateOpen(true);
    setFormCaregiver("");
    setFormNotes("");
    setFormRepeat(false);
    setFormWeekdays([]);
    setFormRecurEnd("");
    setFormStartTime("08:00");
    setFormEndTime("20:00");
    // Início do cuidado vem do contrato (o que a família pediu).
    setFormDate(shiftStartFromContract(contractStartDate));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formCaregiver || !formDate || !formStartTime || !formEndTime) return;

    if (formRepeat) {
      if (formWeekdays.length === 0 || !formRecurEnd) {
        toast.error("Marque os dias da semana e a data final da recorrência.");
        return;
      }
      setCreateLoading(true);
      const result = await createRecurringShifts({
        caregiver_id: formCaregiver,
        patient_id: patientId,
        start_date: formDate,
        end_date: formRecurEnd,
        weekdays: formWeekdays,
        start_time: formStartTime,
        end_time: formEndTime,
        notes: formNotes || undefined,
      });
      if (result.success) {
        setCreateOpen(false);
        invalidate();
        toast.success(
          `${result.created} turno(s) criado(s).` +
            (result.skipped ? ` ${result.skipped} pulado(s) por conflito.` : "")
        );
      } else if (result.error) {
        toast.error(result.error);
      }
      setCreateLoading(false);
      return;
    }

    setCreateLoading(true);
    const { start, end } = shiftDateTimes(formDate, formStartTime, formEndTime);
    const result = await createShift({
      caregiver_id: formCaregiver,
      start,
      end,
      notes: formNotes || undefined,
      patient_id: patientId,
    });
    if (result.success) {
      setCreateOpen(false);
      invalidate();
      result.warnings?.forEach((w) => toast.warning(w));
    } else if (result.error) {
      toast.error(result.error);
    }
    setCreateLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Turnos do Paciente
            </CardTitle>
            <CardDescription>Turnos agendados para este paciente.</CardDescription>
          </div>
          {!isNurse && (
            <Button onClick={openCreate} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Novo Turno
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ShiftMonthCalendar patientId={patientId} />
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Turno</DialogTitle>
            <DialogDescription>Agende um turno para este paciente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="caregiver">Cuidador</Label>
              <Select value={formCaregiver} onValueChange={(v) => v && setFormCaregiver(v)}>
                <SelectTrigger id="caregiver">
                  <SelectValue>
                    {() => {
                      const cg = allCaregivers.find((c) => c.id === formCaregiver);
                      return cg?.name ?? "Selecione um cuidador";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allCaregivers.map((cg) => (
                    <SelectItem key={cg.id} value={cg.id}>
                      {cg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-date">{formRepeat ? "Data de início" : "Data"}</Label>
              <Input
                id="shift-date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Preenchida com o início do cuidado do contrato; ajuste se necessário.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Horário início</Label>
                <Input
                  id="start"
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Horário fim</Label>
                <Input
                  id="end"
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={formRepeat}
                  onCheckedChange={(v) => setFormRepeat(v === true)}
                />
                Repetir (turno recorrente)
              </label>
              {formRepeat && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Dias da semana</Label>
                    <div className="flex flex-wrap gap-1">
                      {WEEKDAY_LABELS.map((d, i) => {
                        const on = formWeekdays.includes(i);
                        return (
                          <Button
                            key={i}
                            type="button"
                            size="sm"
                            variant={on ? "default" : "outline"}
                            className="h-8 w-11 px-0 text-xs"
                            onClick={() =>
                              setFormWeekdays((prev) =>
                                on ? prev.filter((w) => w !== i) : [...prev, i]
                              )
                            }
                          >
                            {d}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="shift-recur-end" className="text-xs">
                      Repetir até
                    </Label>
                    <Input
                      id="shift-recur-end"
                      type="date"
                      value={formRecurEnd}
                      onChange={(e) => setFormRecurEnd(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                placeholder="Instruções adicionais..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  createLoading ||
                  !formCaregiver ||
                  !formDate ||
                  !formStartTime ||
                  !formEndTime ||
                  (formRepeat && (formWeekdays.length === 0 || !formRecurEnd))
                }
              >
                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formRepeat ? "Criar Turnos" : "Criar Turno"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
