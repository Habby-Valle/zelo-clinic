"use client";

import { useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePlanLimits } from "@/features/plan";
import { FeatureUpgradePrompt } from "@/components/feature-upgrade-prompt";
import { useAcknowledgeHealthAlert, useHealthAlerts, useResolveHealthAlert } from "../hooks";
import type { HealthAlertSeverity, HealthAlertStatus } from "../types";

const SEVERITY_ORDER: Record<HealthAlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_VARIANTS: Record<
  HealthAlertSeverity,
  "destructive" | "default" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "default",
  medium: "secondary",
  low: "outline",
};

const SEVERITY_CLASSES: Record<HealthAlertSeverity, string> = {
  critical: "border-red-500 bg-red-50",
  high: "border-amber-400 bg-amber-50",
  medium: "border-blue-300 bg-blue-50",
  low: "border-gray-200",
};

function SeverityDot({ severity }: { severity: HealthAlertSeverity }) {
  const colors: Record<HealthAlertSeverity, string> = {
    critical: "bg-red-500",
    high: "bg-amber-500",
    medium: "bg-blue-500",
    low: "bg-gray-400",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[severity])} />;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AlertStatusBadge({ status }: { status: HealthAlertStatus }) {
  const config: Record<
    HealthAlertStatus,
    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
  > = {
    open: { label: "Aberto", variant: "destructive" },
    acknowledged: { label: "Reconhecido", variant: "secondary" },
    resolved: { label: "Resolvido", variant: "outline" },
    dismissed: { label: "Descartado", variant: "outline" },
  };
  const c = config[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function AlertTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    vital_sign_anomaly: "Sinal Vital",
    medication_skip: "Medicação",
    sos_frequency: "Frequência SOS",
    decline_trend: "Declínio",
    missing_data: "Dados Ausentes",
  };
  return <>{labels[type] ?? type}</>;
}

interface HealthAlertsSectionProps {
  patientId: string;
}

export function HealthAlertsSection({ patientId }: HealthAlertsSectionProps) {
  const { data: planLimits } = usePlanLimits();
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  const hasHealthAlerts = planLimits?.limits?.has_health_alerts ?? true;

  const filters = {
    patient_id: patientId,
    severity: severityFilter as HealthAlertSeverity | "",
    status: statusFilter as HealthAlertStatus | "",
    days: 30,
  };

  const { data: alerts, isLoading } = useHealthAlerts(filters);
  const acknowledge = useAcknowledgeHealthAlert();
  const resolve = useResolveHealthAlert();

  if (!hasHealthAlerts) {
    return <FeatureUpgradePrompt featureName="Alertas de Saúde" />;
  }

  const sortedAlerts = [...(alerts ?? [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
  );

  const openCount = alerts?.filter((a) => a.status === "open").length ?? 0;
  const criticalCount =
    alerts?.filter((a) => a.severity === "critical" && a.status === "open").length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Alertas de Saúde
          {openCount > 0 && (
            <Badge variant={criticalCount > 0 ? "destructive" : "secondary"}>
              {openCount} aberto{openCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Alertas preditivos baseados em sinais vitais, checklists e ocorrências nos últimos 30
          dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Severidade:</span>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "")}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Status:</span>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "")}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Todos</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="acknowledged">Reconhecidos</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sortedAlerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-sm">Nenhum alerta de saúde no período.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  SEVERITY_CLASSES[alert.severity]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityDot severity={alert.severity} />
                      <span className="text-sm font-medium">
                        <AlertTypeLabel type={alert.alert_type} />
                      </span>
                      {alert.indicator && (
                        <span className="text-xs text-muted-foreground">— {alert.indicator}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <Badge variant={SEVERITY_VARIANTS[alert.severity]} className="text-[10px]">
                        {alert.severity_display}
                      </Badge>
                      <AlertStatusBadge status={alert.status} />
                      <span>{formatDate(alert.detected_at)}</span>
                    </div>
                    {alert.details && (
                      <p className="pt-1 text-xs leading-relaxed text-foreground/80">
                        {alert.details}
                      </p>
                    )}
                    {(alert.current_value || alert.expected_range) && (
                      <div className="flex items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                        {alert.current_value && (
                          <span>
                            <span className="font-medium">Valor:</span> {alert.current_value}
                          </span>
                        )}
                        {alert.expected_range && (
                          <span>
                            <span className="font-medium">Esperado:</span> {alert.expected_range}
                          </span>
                        )}
                      </div>
                    )}
                    {alert.ai_insight && (
                      <p className="pt-1 text-[11px] text-muted-foreground italic">
                        IA: {alert.ai_insight}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    {alert.status === "open" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => acknowledge.mutate(alert.id)}
                        disabled={acknowledge.isPending}
                      >
                        {acknowledge.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                        <span className="ml-1 hidden sm:inline">Reconhecer</span>
                      </Button>
                    )}
                    {alert.status !== "resolved" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                        onClick={() => resolve.mutate(alert.id)}
                        disabled={resolve.isPending}
                      >
                        {resolve.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="ml-1 hidden sm:inline">Resolver</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
