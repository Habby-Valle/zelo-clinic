"use client";

import { PartyPopper, Users, ClipboardList, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStats } from "../hooks";
import type { RoleOnboardingStats } from "../types";

const ROLE_LABELS: Record<string, string> = {
  caregiver: "Cuidadores",
  family: "Familiares",
  clinic_admin: "Admins",
  clinic_nurse: "Enfermeiros(as)",
  super_admin: "Super Admins",
};

const ROLE_COLORS: Record<string, string> = {
  caregiver: "bg-blue-500",
  family: "bg-emerald-500",
  clinic_admin: "bg-purple-500",
  clinic_nurse: "bg-amber-500",
  super_admin: "bg-red-500",
};

function formatPct(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function OnboardingSection() {
  const { data: stats, isLoading } = useOnboardingStats();

  const totalProfiles = stats?.reduce((acc, r) => acc + r.total_profiles, 0) ?? 0;
  const totalSteps = stats?.reduce((acc, r) => acc + r.total_steps, 0) ?? 0;
  const totalCompleted = stats?.reduce((acc, r) => acc + r.completed_steps, 0) ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Onboarding de Usuários</CardTitle>
        <PartyPopper className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Total de Usuários</p>
            {!isLoading ? (
              <p className="mt-1 text-2xl font-bold">{totalProfiles}</p>
            ) : (
              <Skeleton className="mt-1 h-7 w-16" />
            )}
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Etapas Programadas</p>
            {!isLoading ? (
              <p className="mt-1 text-2xl font-bold">{totalSteps}</p>
            ) : (
              <Skeleton className="mt-1 h-7 w-16" />
            )}
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            {!isLoading ? (
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {formatPct(totalCompleted, totalSteps)}
              </p>
            ) : (
              <Skeleton className="mt-1 h-7 w-16" />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : stats && stats.length > 0 ? (
          <div className="space-y-2">
            {stats.map((r: RoleOnboardingStats) => {
              const pct = r.total_steps > 0
                ? Math.round((r.completed_steps / r.total_steps) * 100)
                : 0;
              return (
                <div
                  key={r.role}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className={`h-3 w-3 shrink-0 rounded-full ${ROLE_COLORS[r.role] ?? "bg-gray-400"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{ROLE_LABELS[r.role] ?? r.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.total_profiles} perfil(is) · {r.total_steps} etapa(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {r.completed_steps}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="h-3.5 w-3.5" />
                      {r.pending_steps}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {pct}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
            Nenhum dado de onboarding disponível.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
