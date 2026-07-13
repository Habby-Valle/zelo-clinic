"use client";

import { Star, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SatisfactionReportData } from "../types";

interface SatisfactionReportProps {
  data: SatisfactionReportData;
  loading: boolean;
  onExport?: () => void;
}

export function SatisfactionReport({ data, loading, onExport }: SatisfactionReportProps) {
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

  const { summary, byCaregiver, byDate } = data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4" />
          Satisfação dos Familiares
        </CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {summary.totalRatings === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhuma avaliação recebida no período selecionado.
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Média</p>
                <p className="text-2xl font-bold">
                  {summary.avgSatisfaction?.toFixed(1)}
                  <span className="text-amber-500">★</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">NPS</p>
                <p className="text-2xl font-bold">{summary.nps}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avaliações</p>
                <p className="text-2xl font-bold">{summary.totalRatings}</p>
              </div>
            </div>

            {byDate.length > 1 && (
              <div className="mb-4 h-56">
                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
                  <LineChart data={byDate} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} />
                    <YAxis domain={[0, 5]} fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgSatisfaction"
                      name="Média"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Cuidador</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      Avaliações
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Média</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {byCaregiver.map((cg) => (
                    <tr key={cg.caregiverId} className="border-b last:border-0">
                      <td className="py-2 font-medium">{cg.caregiverName}</td>
                      <td className="py-2 text-right">{cg.total}</td>
                      <td className="py-2 text-right text-amber-600">
                        {cg.avgSatisfaction != null ? `${cg.avgSatisfaction.toFixed(1)}★` : "—"}
                      </td>
                      <td className="py-2 text-right">{cg.nps ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
