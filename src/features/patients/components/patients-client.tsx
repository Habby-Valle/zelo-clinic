"use client";

import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, MoreHorizontal, Pencil, Trash2, CheckCircle2, XOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients, useDeletePatient } from "../hooks";
import { usePlanLimits } from "@/features/plan";
import { PlanUsageBadge } from "@/components/plan-usage-badge";
import type { UserRole } from "@/types/common";

const GENDER_LABELS: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
};

function calculateAge(birthDate: string): number {
  const today = new Date();
  const [year, month, day] = birthDate.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PatientsClientProps {
  role: UserRole;
}

export function PatientsClient({ role }: PatientsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deletePatient = useDeletePatient();
  const { data: planLimits } = usePlanLimits();

  const patientsUsage = planLimits?.usage?.patients ?? 0;
  const maxPatients = planLimits?.limits?.max_patients ?? 0;

  const search = searchParams.get("search") ?? "";
  const isActive = searchParams.get("is_active") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const { data, isLoading } = usePatients({ search, isActive, page, pageSize });

  const patients = data?.patients ?? [];
  const total = data?.total ?? 0;

  function updateParams(updates: Record<string, string>) {
    const current = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) current.set(k, v);
      else current.delete(k);
    }
    router.push(`${pathname}?${current.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            Pacientes
            {role === "clinic_admin" && (
              <PlanUsageBadge used={patientsUsage} total={maxPatients} label="pacientes" />
            )}
          </h1>
          <p className="mt-1 text-muted-foreground">Gestão de pacientes da clínica.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => updateParams({ search: e.target.value, page: "" })}
          className="max-w-xs"
        />
        <Select
          value={isActive || "all"}
          onValueChange={(v) =>
            updateParams({ is_active: (v ?? "") === "all" ? "" : (v ?? ""), page: "" })
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              {(v: string | null) => {
                const labels: Record<string, string> = {
                  all: "Todos",
                  true: "Ativo",
                  false: "Inativo",
                };
                return labels[v ?? ""] ?? v ?? "Status";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Cuidadores</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p>Nenhum paciente encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={patient.media?.url ?? patient.photo_url ?? undefined}
                            alt={patient.name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Link href={`/patients/${patient.id}`} className="hover:underline">
                          {patient.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {calculateAge(patient.birth_date)} anos
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {GENDER_LABELS[patient.gender] ?? patient.gender}
                    </TableCell>
                    <TableCell>
                      {patient.caregiver_count > 0 ? (
                        <Badge variant="outline">{patient.caregiver_count}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.is_active ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <XOctagon className="h-3 w-3" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-8 w-8"
                          )}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(patient.id)}
                            variant="destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={(p) => updateParams({ page: String(p) })}
        label="pacientes"
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deletePatient.isPending}
              onClick={() =>
                deletePatient.mutate(deleteId!, {
                  onSuccess: () => setDeleteId(null),
                })
              }
            >
              {deletePatient.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
