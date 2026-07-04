"use client";

import { ClipboardCheck, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useComplianceStats } from "../hooks";
import type { ComplianceStats as ComplianceStatsType } from "../types";

function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

function ComplianceBadge({ pct }: { pct: number }) {
  if (pct >= 90) {
    return (
      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {formatPct(pct)}
      </Badge>
    );
  }
  if (pct >= 70) {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {formatPct(pct)}
      </Badge>
    );
  }
  return (
    <Badge variant="destructive">
      <ShieldAlert className="mr-1 h-3 w-3" />
      {formatPct(pct)}
    </Badge>
  );
}

export function ComplianceSection() {
  const { data: stats, isLoading } = useComplianceStats();

  const totalShifts = stats?.reduce((acc: number, s: ComplianceStatsType) => acc + s.total_shifts, 0) ?? 0;
  const avgCompliance =
    stats && stats.length > 0
      ? stats.reduce((acc: number, s: ComplianceStatsType) => acc + s.avg_compliance_pct, 0) / stats.length
      : null;
  const lowCaregivers = stats?.filter((s: ComplianceStatsType) => s.avg_compliance_pct < 70).length ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Conformidade de Protocolo</CardTitle>
        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Conformidade Média</p>
            {avgCompliance !== null ? (
              <p className="mt-1 text-2xl font-bold">{formatPct(avgCompliance)}</p>
            ) : (
              <Skeleton className="mt-1 h-7 w-20" />
            )}
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Turnos Avaliados</p>
            <p className="mt-1 text-2xl font-bold">{totalShifts}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Abaixo do Ideal</p>
            <p className={lowCaregivers > 0 ? "mt-1 text-2xl font-bold text-amber-600" : "mt-1 text-2xl font-bold"}>
              {lowCaregivers}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : stats && stats.length > 0 ? (
          <div className="space-y-2">
            {stats.map((s: ComplianceStatsType) => (
              <div
                key={s.caregiver_id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.caregiver_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.total_shifts} turno{s.total_shifts !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="ml-3 shrink-0">
                  <ComplianceBadge pct={s.avg_compliance_pct} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
            Nenhum dado de conformidade disponível.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
