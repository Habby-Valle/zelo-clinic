"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Clock,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCaregiverHours,
  useCaregiverHoursSummary,
} from "../hooks";
import type { CaregiverWorkLog } from "../types";

function formatHours(totalHours: string): string {
  const num = parseFloat(totalHours);
  if (isNaN(num)) return "0h";
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekday = weekdays[date.getDay()];
  return `${day}/${month} (${weekday})`;
}

function getDefaultRange(): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 30);
  const start = start30.toISOString().split("T")[0];
  return { start, end };
}

export function CaregiverHoursClient() {
  const defaultRange = getDefaultRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({ start_date: startDate, end_date: endDate, page }),
    [startDate, endDate, page]
  );

  const { data: pageData, isLoading } = useCaregiverHours(filters);
  const { data: summary } = useCaregiverHoursSummary(startDate, endDate);

  const totalPages = useMemo(
    () => (pageData ? Math.ceil(pageData.count / 365) : 0),
    [pageData]
  );

  const handleExport = useCallback(() => {
    if (!pageData?.results?.length) return;
    const headers = [
      "Data",
      "Cuidador",
      "Horas",
      "Turnos",
      "Completados",
      "Cancelados",
      "Noturno",
    ];
    const rows = pageData.results.map((w: CaregiverWorkLog) => [
      w.date,
      w.caregiver_name,
      w.total_hours,
      String(w.shift_count),
      String(w.completed),
      String(w.cancelled),
      w.overnight ? "Sim" : "Não",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `horas-cuidadores-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pageData, startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Horas
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">
                {formatHours(summary.total_hours)}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
            <p className="text-xs text-muted-foreground">
              Período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Média por Turno
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">
                {formatHours(summary.avg_hours_per_shift)}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
            <p className="text-xs text-muted-foreground">Média do período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Registros
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pageData ? (
              <div className="text-2xl font-bold">
                {pageData.count}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
            <p className="text-xs text-muted-foreground">
              Dias com registro no período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtrar Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="start-date">Data Início</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-44"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="end-date">Data Fim</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-44"
              />
            </div>
            {pageData?.results?.length ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="ml-auto"
              >
                <Download className="mr-1.5 h-4 w-4" />
                Exportar CSV
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Registro de Horas por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : pageData?.results?.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Nenhum registro encontrado para o período selecionado.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cuidador</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="text-right">Turnos</TableHead>
                    <TableHead className="text-right">Completados</TableHead>
                    <TableHead className="text-right">Cancelados</TableHead>
                    <TableHead className="text-center">Noturno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData?.results?.map((w: CaregiverWorkLog) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">
                        {formatDate(w.date)}
                      </TableCell>
                      <TableCell>{w.caregiver_name}</TableCell>
                      <TableCell className="text-right">
                        {formatHours(w.total_hours)}
                      </TableCell>
                      <TableCell className="text-right">
                        {w.shift_count}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {w.completed}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {w.cancelled}
                      </TableCell>
                      <TableCell className="text-center">
                        {w.overnight ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Sim
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
