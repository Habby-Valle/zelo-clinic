"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useContract, useApproveContract, useRejectContract } from "../hooks";
import type { ContractStatus } from "../types";
import { CONTRACT_STATUS_LABELS } from "../types";

const STATUS_VARIANTS: Record<
  ContractStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  requested: "secondary",
  draft: "outline",
  active: "default",
  suspended: "outline",
  cancelled: "destructive",
  expired: "outline",
};

function formatCurrency(value: string | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function ContractDetailClient() {
  const params = useParams();
  const id = params.id as string;

  const { data: contract, isLoading } = useContract(id);
  const approveContract = useApproveContract(id);
  const rejectContract = useRejectContract(id);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [pricePerHour, setPricePerHour] = useState("");
  const [pricePerShift, setPricePerShift] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">Contrato não encontrado</p>
        <Link href="/contracts" className={cn(buttonVariants({ variant: "outline" }))}>
          Voltar para contratos
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    approveContract.mutate(
      {
        price_per_hour: Number(pricePerHour),
        price_per_shift: Number(pricePerShift),
      },
      {
        onSuccess: () => {
          setApproveOpen(false);
        },
      }
    );
  };

  const handleReject = () => {
    rejectContract.mutate(undefined, {
      onSuccess: () => {
        setRejectOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/contracts"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {contract.contract_number}
            </h1>
            <Badge variant={STATUS_VARIANTS[contract.status]}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            {contract.patient_name} — {contract.clinic_name}
          </p>
        </div>
      </div>

      {contract.status === "requested" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">
              Este contrato está pendente de aprovação.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Recusar
              </Button>
              <Button onClick={() => setApproveOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprovar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Nº do contrato" value={contract.contract_number} />
            <Row label="Status" value={CONTRACT_STATUS_LABELS[contract.status]} />
            <Row label="Data de início" value={formatDate(contract.start_date)} />
            <Row
              label="Data de término"
              value={contract.end_date ? formatDate(contract.end_date) : "Indeterminado"}
            />
            <Row label="Horas semanais" value={`${contract.weekly_hours}h`} />
            <Row label="Observações" value={contract.notes || "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partes Envolvidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Paciente" value={contract.patient_name} />
            <Row
              label="Solicitante"
              value={contract.requested_by_name ?? contract.payer_name}
            />
            <Row label="Contratante" value={contract.payer_name} />
            <Row label="Clínica" value={contract.clinic_name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row
              label="Preço por hora"
              value={formatCurrency(contract.price_per_hour)}
            />
            <Row
              label="Preço por turno"
              value={formatCurrency(contract.price_per_shift)}
            />
            <Row
              label="Adicional noturno"
              value={
                contract.night_surcharge
                  ? contract.night_surcharge_type === "percentage"
                    ? `${contract.night_surcharge}%`
                    : formatCurrency(contract.night_surcharge)
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Criado em" value={formatDate(contract.created_at)} />
            <Row label="Atualizado em" value={formatDate(contract.updated_at)} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Contrato</DialogTitle>
            <DialogDescription>
              Defina os valores antes de ativar o contrato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="price_per_hour">Preço por hora (R$)</Label>
              <Input
                id="price_per_hour"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_per_shift">Preço por turno (R$)</Label>
              <Input
                id="price_per_shift"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={pricePerShift}
                onChange={(e) => setPricePerShift(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={
                approveContract.isPending || !pricePerHour || !pricePerShift
              }
            >
              {approveContract.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar Contrato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja recusar este contrato? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={rejectContract.isPending}
              onClick={handleReject}
            >
              {rejectContract.isPending ? "Recusando..." : "Sim, Recusar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
