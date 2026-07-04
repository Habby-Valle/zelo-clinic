"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { FileText, MoreHorizontal, Eye, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useContracts } from "../hooks";
import type { ContractStatus } from "../types";
import { CONTRACT_STATUS_LABELS } from "../types";

const STATUS_VARIANTS: Record<ContractStatus, "default" | "secondary" | "destructive" | "outline"> =
  {
    requested: "secondary",
    proposal_sent: "secondary",
    draft: "outline",
    active: "default",
    suspended: "outline",
    cancelled: "destructive",
    expired: "outline",
  };

const STATUS_TABS = [
  { value: "", label: "Todos" },
  { value: "requested", label: "Pendentes" },
  { value: "proposal_sent", label: "Proposta enviada" },
  { value: "active", label: "Ativos" },
] as const;

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

export function ContractsListClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const { data, isLoading } = useContracts({ status, search, page, pageSize });

  const contracts = data?.contracts ?? [];
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
        <h1 className="text-2xl font-bold tracking-tight">Contratos</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie os contratos de prestação de serviços.
        </p>
      </div>

      <Tabs value={status} onValueChange={(v) => updateParams({ status: v, page: "" })}>
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
            placeholder="Buscar por paciente, contratante..."
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
                <TableHead>Contrato</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[60px]"></TableHead>
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
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Nenhum contrato encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => {
                  const statusKey = contract.status as ContractStatus;
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        <Link href={`/contracts/${contract.id}`} className="hover:underline">
                          {contract.contract_number}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{contract.patient_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {contract.requested_by_name ?? contract.payer_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[statusKey]}>
                          {CONTRACT_STATUS_LABELS[statusKey]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(contract.start_date)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatCurrency(contract.price_per_hour ?? contract.price_per_shift)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon" }),
                              "h-8 w-8"
                            )}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/contracts/${contract.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            contratos
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
    </div>
  );
}
