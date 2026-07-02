"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Receipt, Search } from "lucide-react";
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
import { useInvoices, useInvoiceStats } from "../hooks";
import type { InvoiceStatus } from "../types";
import { INVOICE_STATUS_LABELS } from "../types";

const STATUS_VARIANTS: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> =
  {
    pending: "secondary",
    paid: "default",
    cancelled: "destructive",
  };

const STATUS_TABS = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "paid", label: "Pagas" },
] as const;

function formatCurrency(value: string): string {
  if (!value || value === "0") return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function BillingListClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const { data, isLoading } = useInvoices({ status, page, pageSize });
  const { data: stats } = useInvoiceStats();

  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faturas</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie as faturas de servi&ccedil;os prestados.
        </p>
      </div>

      {stats && (
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendente</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(stats.total_pending)}
              </p>
              <p className="text-xs text-muted-foreground">{stats.pending_count} fatura(s)</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.total_paid)}
              </p>
              <p className="text-xs text-muted-foreground">{stats.paid_count} fatura(s)</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={status} onValueChange={(v) => updateParams({ status: v, page: "" })}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fatura</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Per&iacute;odo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Receipt className="h-8 w-8" />
                      <p>Nenhuma fatura encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => {
                  const statusKey = invoice.status as InvoiceStatus;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        <Link href={`/billing/${invoice.id}`} className="hover:underline">
                          {invoice.invoice_number}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{invoice.patient_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[statusKey]}>
                          {INVOICE_STATUS_LABELS[statusKey]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(invoice.total_amount)}
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
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, total)} de {total}{" "}
            faturas
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
              Pr&oacute;xima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
