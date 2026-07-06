"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Loader2, QrCode } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { useInvoice, useUpdateInvoiceStatus } from "../hooks";
import type { InvoiceStatus } from "../types";
import { INVOICE_STATUS_LABELS } from "../types";

const STATUS_VARIANTS: Record<InvoiceStatus, "default" | "secondary" | "destructive" | "outline"> =
  {
    pending: "secondary",
    paid: "default",
    cancelled: "destructive",
  };

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function BillingDetailClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: invoice, isLoading } = useInvoice(id);
  const updateStatus = useUpdateInvoiceStatus(id);

  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">Fatura n&atilde;o encontrada</p>
        <Link href="/billing" className={cn(buttonVariants({ variant: "outline" }))}>
          Voltar para faturas
        </Link>
      </div>
    );
  }

  const handleMarkPaid = () => {
    updateStatus.mutate("paid", {
      onSuccess: () => setPayOpen(false),
    });
  };

  const handleMarkCancelled = () => {
    updateStatus.mutate("cancelled", {
      onSuccess: () => setCancelOpen(false),
    });
  };

  const statusKey = invoice.status as InvoiceStatus;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/billing"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{invoice.invoice_number}</h1>
            <Badge variant={STATUS_VARIANTS[statusKey]}>{INVOICE_STATUS_LABELS[statusKey]}</Badge>
            {invoice.pix_status && (
              <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-700">
                <QrCode className="h-3 w-3" />
                PIX
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">
            {invoice.patient_name} — {invoice.clinic_name}
          </p>
        </div>
      </div>

      {invoice.status === "pending" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">Fatura aguardando pagamento.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCancelOpen(true)}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={() => setPayOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como Paga
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informa&ccedil;&otilde;es</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Fatura" value={invoice.invoice_number} />
            <Row label="Status" value={INVOICE_STATUS_LABELS[statusKey]} />
            <Row
              label="Per&iacute;odo"
              value={`${formatDate(invoice.period_start)} — ${formatDate(invoice.period_end)}`}
            />
            <Row
              label="Vencimento"
              value={invoice.due_date ? formatDate(invoice.due_date) : "—"}
            />
            <Row label="Paciente" value={invoice.patient_name} />
            <Row label="Contratante" value={invoice.payer_name} />
            {invoice.paid_at && <Row label="Pago em" value={formatDate(invoice.paid_at)} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Total" value={formatCurrency(invoice.total_amount)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Turnos ({invoice.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hor&aacute;rio</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Valor hora</TableHead>
                <TableHead>Ad. noturno</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.hours}h</TableCell>
                  <TableCell>{formatCurrency(item.hourly_rate)}</TableCell>
                  <TableCell>{formatCurrency(item.night_surcharge)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(invoice.total_amount)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={payOpen} onOpenChange={setPayOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar fatura {invoice.invoice_number} como paga?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={updateStatus.isPending} onClick={handleMarkPaid}>
              {updateStatus.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Fatura</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta fatura? Esta a&ccedil;&atilde;o n&atilde;o pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={updateStatus.isPending}
              onClick={handleMarkCancelled}
            >
              {updateStatus.isPending ? "Cancelando..." : "Sim, Cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
