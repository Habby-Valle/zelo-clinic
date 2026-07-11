"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCarePlans,
  useApproveCarePlan,
  useReturnCarePlan,
  useUpdateCarePlanChecklists,
} from "../hooks/use-care-plans";
import { CARE_PLAN_STATUS_LABELS, type CarePlanStatus } from "../types";

const STATUS_VARIANTS: Record<CarePlanStatus, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  pending_review: "secondary",
  active: "default",
  archived: "outline",
};

const STATUS_TABS = [
  { value: "", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "pending_review", label: "Em revisão" },
  { value: "draft", label: "Rascunho" },
  { value: "archived", label: "Arquivados" },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function CarePlansListClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const [returnFor, setReturnFor] = useState<string | null>(null);
  const [returnNote, setReturnNote] = useState("");

  const { data, isLoading } = useCarePlans({ status: status || undefined, search: search || undefined, page, pageSize });
  const approve = useApproveCarePlan();
  const returnPlan = useReturnCarePlan();
  const updateChecklists = useUpdateCarePlanChecklists();

  const plans = data?.plans ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);
  const busy = approve.isPending || returnPlan.isPending;

  function updateParams(updates: Record<string, string>) {
    const current = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) current.set(k, v);
      else current.delete(k);
    }
    router.push(`${pathname}?${current.toString()}`);
  }

  async function handleApprove(planId: string) {
    try {
      await approve.mutateAsync(planId);
      toast.success("Plano aprovado e ativado.");
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar plano.");
    }
  }

  async function handleReturn() {
    if (!returnFor || !returnNote.trim()) return;
    try {
      await returnPlan.mutateAsync({ planId: returnFor, note: returnNote.trim() });
      toast.success("Plano devolvido.");
      setReturnFor(null);
      setReturnNote("");
      queryClient.invalidateQueries({ queryKey: ["care-plans"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao devolver plano.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos de Cuidado</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie todos os planos de cuidado da clínica.
        </p>
      </div>

      <Tabs
        value={status}
        onValueChange={(v) => updateParams({ status: v, page: "" })}
      >
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente..."
            value={search}
            onChange={(e) => updateParams({ search: e.target.value, page: "" })}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cuidador</TableHead>
                <TableHead>Checklists</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[180px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ClipboardList className="h-8 w-8" />
                      <p>Nenhum plano de cuidado encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => {
                  const statusKey = plan.status as CarePlanStatus;
                  return (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/patients/${plan.patient_id}`}
                          className="hover:underline"
                        >
                          {plan.patient_name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[statusKey]}>
                          {CARE_PLAN_STATUS_LABELS[statusKey]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {plan.caregiver_name || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {plan.checklists.length}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(plan.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/patients/${plan.patient_id}`)}
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            Ver paciente
                          </Button>
                          {plan.status === "pending_review" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(plan.id)}
                                disabled={busy}
                              >
                                {approve.isPending ? (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setReturnFor(plan.id);
                                  setReturnNote("");
                                }}
                                disabled={busy}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Devolver
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total} planos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Return dialog */}
      {returnFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Devolver plano</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explique o que precisa ser corrigido. A clínica verá o motivo.
            </p>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">Motivo</label>
              <textarea
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                rows={4}
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="Ex.: incluir checklist de sinais vitais; remover..."
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReturnFor(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReturn}
                disabled={returnPlan.isPending || !returnNote.trim()}
              >
                {returnPlan.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Devolver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
