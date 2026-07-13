"use client";

import { AlertTriangle, Clock, CheckCircle, XCircle, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SosReportData } from "../types";

interface SosReportProps {
  data: SosReportData;
  loading: boolean;
  onExport?: () => void;
}

export function SosReport({ data, loading, onExport }: SosReportProps) {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4" />
          Alertas SOS
        </CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {data.summary.total === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhum alerta SOS no período selecionado.
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-5 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{data.summary.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {data.summary.active}
                </p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-600">
                  <Clock className="h-4 w-4" />
                  {data.summary.acknowledged}
                </p>
                <p className="text-xs text-muted-foreground">Confirmados</p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {data.summary.resolved}
                </p>
                <p className="text-xs text-muted-foreground">Resolvidos</p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
                  <XCircle className="h-4 w-4" />
                  {data.summary.avgResponseTimeMinutes !== null
                    ? `${data.summary.avgResponseTimeMinutes}min`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Tempo médio de resposta</p>
              </div>
            </div>

            {data.byPatient.length > 0 && (
              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Alertas por Paciente
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                    <BarChart data={data.byPatient}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="patientName" fontSize={12} tickLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="resolved"
                        name="Resolvidos"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {data.byDate.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Alertas ao Longo do Tempo
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                    <BarChart data={data.byDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(v: string) =>
                          new Date(v).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })
                        }
                      />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="acknowledged"
                        name="Confirmados"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="resolved"
                        name="Resolvidos"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
