"use client";

import { DollarSign, Download } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BillingReportData } from "../types";

interface BillingReportProps {
  data: BillingReportData | null;
  loading: boolean;
  onExport?: () => void;
}

export function BillingReport({ data, loading, onExport }: BillingReportProps) {
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

  const { summary, byMonth, byContract } = data;

  const chartData = byMonth.map((m) => ({
    ...m,
    month: new Date(m.month + "-01").toLocaleDateString("pt-BR", {
      month: "short",
      year: "2-digit",
    }),
    paid: Number(m.paid),
    pending: Number(m.pending),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4" />
          Faturamento
        </CardTitle>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              R$ {Number(summary.totalRevenue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Receita Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              R$ {Number(summary.totalPaid).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Recebido</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              R$ {Number(summary.totalPending).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              R$ {Number(summary.avgInvoiceValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Ticket Médio</p>
          </div>
        </div>

        <div className="mb-6 h-64">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Faturamento por Mês
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 300 }}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    `R$${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value) =>
                    `R$ ${Number(value ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  }
                />
                <Legend />
                <Bar dataKey="paid" name="Recebido" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="pending" name="Pendente" fill="#eab308" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sem dados
            </div>
          )}
        </div>

        {byContract.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Top Contratos por Valor Faturado
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="text-right">Faturado</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byContract.map((c) => (
                  <TableRow key={c.contractId}>
                    <TableCell className="font-medium">{c.contractNumber}</TableCell>
                    <TableCell>{c.patientName}</TableCell>
                    <TableCell className="text-right">
                      R$ {Number(c.totalInvoiced).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(c.totalPaid).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
