"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuditLog } from "../hooks";
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

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function AuditLogDetailClient() {
  const params = useParams();
  const id = params.id as string;
  const { data: log, isLoading } = useAuditLog(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Log de auditoria não encontrado.
      </div>
    );
  }

  const changes = log.changes as Record<string, unknown> | null;
  const isCreate = changes && "created" in changes && !("before" in changes);
  const isDelete = changes && "deleted" in changes && !("after" in changes);
  const hasDiff = changes && "before" in changes && "after" in changes;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/audit-logs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={ACTION_COLORS[log.action] ?? "outline"} className="px-3 py-1 text-sm">
          {ACTION_LABELS[log.action] ?? log.action}
        </Badge>
        <span className="text-muted-foreground">{log.description}</span>
      </div>

      <div className="text-sm text-muted-foreground">
        {log.user_name && <span>{log.user_name}</span>}
        {log.user_email && <span> &middot; {log.user_email}</span>}
        {log.ip_address && <span> &middot; IP: {log.ip_address}</span>}
        <span> &middot; {formatDateTime(log.created_at)}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuário</span>
              <span className="font-medium">{log.user_name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{log.user_email ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP</span>
              <span className="font-mono font-medium">{log.ip_address ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Objeto Afetado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">{log.content_type_name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-mono font-medium">{log.object_id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Alterações</CardTitle>
        </CardHeader>
        <CardContent>
          {isCreate && changes?.created && typeof changes.created === "object" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(changes.created as Record<string, unknown>).map(
                    ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {value === null ? "—" : String(value)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          ) : isDelete && changes?.deleted && typeof changes.deleted === "object" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor Removido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(changes.deleted as Record<string, unknown>).map(
                    ([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {value === null ? "—" : String(value)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          ) : hasDiff &&
            changes?.before &&
            changes?.after &&
            Array.isArray(changes.changed_fields) ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Antes</TableHead>
                    <TableHead>Depois</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(changes.changed_fields as string[]).map((field: string) => (
                    <TableRow key={field}>
                      <TableCell className="font-medium">{field}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {(changes.before as Record<string, unknown>)[field] === null
                          ? "—"
                          : String((changes.before as Record<string, unknown>)[field] ?? "—")}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {(changes.after as Record<string, unknown>)[field] === null
                          ? "—"
                          : String((changes.after as Record<string, unknown>)[field] ?? "—")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem alterações registradas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
