"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useAuditLogs } from "../hooks";
import { fetchAuditLogsApi } from "../services";
import { usePlanLimits } from "@/features/plan";
import { FeatureUpgradePrompt } from "@/components/feature-upgrade-prompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

const ACTION_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  status_change: "outline",
  login: "outline",
  invite_sent: "outline",
  invite_accepted: "outline",
  payment_success: "secondary",
  payment_failed: "destructive",
  subscription_activated: "secondary",
  subscription_cancelled: "secondary",
};

const ACTION_LABELS: Record<string, string> = {
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  status_change: "Mudança de Status",
  login: "Login",
  invite_sent: "Convite Enviado",
  invite_accepted: "Convite Aceito",
  payment_success: "Pagamento",
  payment_failed: "Falha Pagamento",
  subscription_activated: "Ativação",
  subscription_cancelled: "Cancelamento",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditLogsClient() {
  const { data: planLimits } = usePlanLimits();
  const canAccessAuditLogs = (planLimits?.limits?.audit_log_days ?? 0) > 0;

  const [action, setAction] = useState("");
  const [contentType, setContentType] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      action: action || undefined,
      content_type: contentType || undefined,
      search: search || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      page_size: 20,
    }),
    [action, contentType, search, dateFrom, dateTo, page]
  );

  const { data, isLoading } = useAuditLogs(filters);

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  function resetPage() {
    setPage(1);
  }

  async function handleExport() {
    const result = await fetchAuditLogsApi({ ...filters, page: 1, page_size: 10000 });
    const allLogs = result.logs;

    const headers = ["Data/Hora", "Usuário", "Email", "Ação", "Entidade", "Descrição"];
    const rows = allLogs.map((log) => [
      formatDate(log.created_at),
      log.user_name ?? "—",
      log.user_email ?? "—",
      ACTION_LABELS[log.action] ?? log.action,
      log.content_type_name ?? "—",
      log.description,
    ]);

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-6">
      {!canAccessAuditLogs && <FeatureUpgradePrompt featureName="Logs de Auditoria" />}

      {canAccessAuditLogs && (
        <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h1>
          <p className="mt-1 text-muted-foreground">Ações realizadas na clínica.</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString("pt-BR")} registro{total !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap gap-3">
            <Select
              value={action || "all"}
              onValueChange={(v) => {
                setAction(v === "all" ? "" : (v ?? ""));
                resetPage();
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue>
                  {(v: string | null) =>
                    v && v !== "all" ? (ACTION_LABELS[v] ?? v) : "Todas ações"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="status_change">Mudança Status</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="invite_sent">Convite</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={contentType || "all"}
              onValueChange={(v) => {
                setContentType(v === "all" ? "" : (v ?? ""));
                resetPage();
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue>
                  {(v: string | null) => (v && v !== "all" ? v : "Todas entidades")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas entidades</SelectItem>
                <SelectItem value="shift">Turno</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
                <SelectItem value="patient">Paciente</SelectItem>
                <SelectItem value="invite">Convite</SelectItem>
                <SelectItem value="profilecaregiver">Cuidador</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Buscar descrição..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="w-48"
            />

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  resetPage();
                }}
                className="w-36"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  resetPage();
                }}
                className="w-36"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Nenhum log encontrado para os filtros selecionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user_name ?? "—"}</p>
                          {log.user_email && (
                            <p className="text-xs text-muted-foreground">{log.user_email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_COLORS[log.action] ?? "outline"}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.content_type_name ?? log.object_id}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.description}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {total.toLocaleString("pt-BR")} registro{total !== 1 ? "s" : ""} encontrado
                {total !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span>
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}
