"use client";

import { FileText, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContractsReportData } from "../types";

interface ContractsReportProps {
  data: ContractsReportData | null;
  loading: boolean;
  onExport?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#22c55e",
  suspended: "#eab308",
  cancelled: "#ef4444",
  expired: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Ativos",
  suspended: "Suspensos",
  cancelled: "Cancelados",
  expired: "Expirados",
};

export function ContractsReport({ data, loading, onExport }: ContractsReportProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          Nenhum dado disponível.
        </CardContent>
      </Card>
    );
  }

  const { summary, byMonth, avgPricePerHour, avgPricePerShift, avgWeeklyHours } = data;

  const donutData = Object.entries(STATUS_LABELS)
    .filter(([key]) => key !== "total")
    .map(([key, label]) => ({
      name: label,
      value: summary[key as keyof typeof summary] as number,
      color: STATUS_COLORS[key],
    }))
    .filter((d) => d.value > 0);

  const chartData = byMonth.map((m) => ({
    ...m,
    month: new Date(m.month + "-01").toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    }),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Contratos
        </CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{summary.active}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.suspended}</p>
            <p className="text-xs text-muted-foreground">Suspensos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{summary.cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-500">{summary.expired}</p>
            <p className="text-xs text-muted-foreground">Expirados</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold">R$ {Number(avgPricePerHour).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Preço médio / hora</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold">R$ {Number(avgPricePerShift).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Preço médio / turno</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-bold">{avgWeeklyHours}h</p>
            <p className="text-xs text-muted-foreground">Média horas / semana</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex h-64 flex-col">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Distribuição por Status
            </p>
            <div className="min-h-0 flex-1">
              {donutData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{ width: 500, height: 300 }}
                >
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sem dados
                </div>
              )}
            </div>
          </div>

          <div className="flex h-64 flex-col">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Novos Contratos por Mês
            </p>
            <div className="min-h-0 flex-1">
              {chartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  initialDimension={{ width: 500, height: 300 }}
                >
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="new" name="Novos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sem dados
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
