"use client";

import { useMemo, useState, useCallback } from "react";
import { Wallet, Clock, CalendarCheck, HelpCircle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlanLimits } from "@/features/plan";
import { FeatureUpgradePrompt } from "@/components/feature-upgrade-prompt";
import { useCostReport } from "../hooks";
import type { CostReportFilters, CostShiftRow } from "../types";

const BILLING_MODE_LABELS: Record<string, string> = {
  per_hour: "Por hora",
  per_shift: "Por turno",
  fixed: "Mensal fixo",
};

function getDefaultRange(): { date_from: string; date_to: string } {
  const now = new Date();
  const from = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const to = now.toISOString().split("T")[0];
  return { date_from: from, date_to: to };
}

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function formatHours(totalHours: number): string {
  if (isNaN(totalHours)) return "0h";
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CostReportClient() {
  const { data: planLimits } = usePlanLimits();
  const canAccessReports = planLimits?.limits?.reports_level !== "none";

  const defaultRange = getDefaultRange();
  const [filters, setFilters] = useState<CostReportFilters>(defaultRange);

  const { data, isLoading } = useCostReport(filters);

  const handleExport = useCallback(() => {
    if (!data?.shifts?.length) return;
    const rows = data.shifts.map((s: CostShiftRow) => [
      formatDate(s.date),
      s.contractNumber,
      s.patientName,
      s.caregiverName,
      String(s.hours).replace(".", ","),
      BILLING_MODE_LABELS[s.billingMode] ?? s.billingMode,
      s.cost != null ? formatCurrency(s.cost) : "",
    ]);
    const csv = buildCsv(
      ["Data", "Contrato", "Paciente", "Cuidador", "Horas", "Cobrança", "Custo"],
      rows
    );
    downloadCsv(csv, `relatorio-custos-${filters.date_from}-${filters.date_to}.csv`);
  }, [data, filters]);

  const byContract = useMemo(
    () => [...(data?.byContract ?? [])].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)),
    [data]
  );

  return (
    <div className="space-y-6">
      {!canAccessReports && <FeatureUpgradePrompt featureName="Relatórios" />}

      {canAccessReports && (
        <>
          {/* Summary Cards */}
          {isLoading ? (
            <KpiSkeleton />
          ) : (
            data && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(data.summary.totalCost)}
                    </div>
                    <p className="text-xs text-muted-foreground">Período selecionado</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatHours(data.summary.totalHours)}</div>
                    <p className="text-xs text-muted-foreground">Turnos concluídos</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Turnos Concluídos</CardTitle>
                    <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.summary.totalShifts}</div>
                    <p className="text-xs text-muted-foreground">No período</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Sem Preço</CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.summary.unpricedShiftCount}</div>
                    <p className="text-xs text-muted-foreground">
                      {data.summary.unpricedContractCount} contrato(s) sem preço
                    </p>
                  </CardContent>
                </Card>
              </div>
            )
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtrar Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cost-start-date">Data Início</Label>
                  <Input
                    id="cost-start-date"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
                    className="w-44"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cost-end-date">Data Fim</Label>
                  <Input
                    id="cost-end-date"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
                    className="w-44"
                  />
                </div>
                {data?.shifts?.length ? (
                  <Button variant="outline" size="sm" onClick={handleExport} className="ml-auto">
                    <Download className="mr-1.5 h-4 w-4" />
                    Exportar CSV
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* By contract */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custo por Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : byContract.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Nenhum turno concluído no período selecionado.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrato</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Cobrança</TableHead>
                      <TableHead className="text-right">Turnos</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {byContract.map((c) => (
                      <TableRow key={c.contractId}>
                        <TableCell className="font-medium">{c.contractNumber}</TableCell>
                        <TableCell>{c.patientName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{BILLING_MODE_LABELS[c.billingMode] ?? c.billingMode}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{c.shifts}</TableCell>
                        <TableCell className="text-right">{formatHours(c.hours)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {c.cost != null ? formatCurrency(c.cost) : <span className="text-muted-foreground">Sem preço</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* By month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custo por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (data?.byMonth ?? []).length === 0 ? (
                <div className="flex h-24 items-center justify-center text-muted-foreground">
                  Sem dados para o período.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês</TableHead>
                        <TableHead className="text-right">Turnos</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.byMonth ?? []).map((m) => (
                        <TableRow key={m.month}>
                          <TableCell className="font-medium">{m.month}</TableCell>
                          <TableCell className="text-right">{m.shifts}</TableCell>
                          <TableCell className="text-right">{formatHours(m.hours)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(m.cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shift rows */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhamento por Turno</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (data?.shifts ?? []).length === 0 ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Nenhum turno concluído no período selecionado.
                </div>
              ) : (
                <div className="max-h-[480px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Cuidador</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.shifts ?? []).map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{formatDate(s.date)}</TableCell>
                          <TableCell>{s.contractNumber}</TableCell>
                          <TableCell>{s.patientName || "—"}</TableCell>
                          <TableCell>{s.caregiverName || "—"}</TableCell>
                          <TableCell className="text-right">{formatHours(s.hours)}</TableCell>
                          <TableCell className="text-right">
                            {s.cost != null ? (
                              formatCurrency(s.cost)
                            ) : (
                              <span className="text-muted-foreground">Sem preço</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
