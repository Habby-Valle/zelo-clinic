"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReportSummary,
  useShiftsReport,
  useChecklistsReport,
  usePatientsGrowthReport,
  useFamilyMembersGrowthReport,
  useSosReport,
  useCaregiversReport,
  useSatisfactionReport,
} from "../hooks/use-reports";
import { ReportsFilters } from "./reports-filters";
import { SummaryCards } from "./summary-cards";
import { ShiftsReport } from "./shifts-report";
import { ChecklistsReport } from "./checklists-report";
import { PatientsGrowthReport } from "./patients-growth-report";
import { FamilyMembersGrowthReport } from "./family-members-growth-report";
import { SosReport } from "./sos-report";
import { CaregiversReport } from "./caregivers-report";
import { SatisfactionReport } from "./satisfaction-report";
import { ComplianceSection } from "@/features/quality";
import { OnboardingSection } from "@/features/onboarding";
import { usePlanLimits } from "@/features/plan";
import { FeatureUpgradePrompt } from "@/components/feature-upgrade-prompt";
import type { DateRange } from "../types";

function getDefaultDateRange(): DateRange {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const to = now.toISOString().split("T")[0];
  return { from, to };
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function SummaryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ReportsClient() {
  const { data: planLimits } = usePlanLimits();
  const canAccessReports = planLimits?.limits?.reports_level !== "none";

  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);

  const summaryQuery = useReportSummary();
  const shiftsQuery = useShiftsReport(dateRange);
  const checklistsQuery = useChecklistsReport(dateRange);
  const patientsQuery = usePatientsGrowthReport(6);
  const familyMembersQuery = useFamilyMembersGrowthReport(6);
  const sosQuery = useSosReport(dateRange);
  const caregiversQuery = useCaregiversReport(dateRange);
  const satisfactionQuery = useSatisfactionReport(dateRange);

  const isPending = shiftsQuery.isLoading || checklistsQuery.isLoading || patientsQuery.isLoading;

  const handleFilterChange = useCallback(({ dateRange: dr }: { dateRange: DateRange }) => {
    setDateRange(dr);
  }, []);

  function exportShiftsCsv() {
    const csv = buildCsv(
      ["Data", "Total", "Concluídos", "Cancelados"],
      (shiftsQuery.data ?? []).map((d) => [
        d.date,
        String(d.total),
        String(d.completed),
        String(d.cancelled),
      ])
    );
    downloadCsv(csv, "relatorio-turnos.csv");
  }

  function exportChecklistsCsv() {
    const csv = buildCsv(
      ["Data", "Concluídos", "Pendentes"],
      (checklistsQuery.data ?? []).map((d) => [d.date, String(d.completed), String(d.pending)])
    );
    downloadCsv(csv, "relatorio-checklists.csv");
  }

  function exportFamilyMembersCsv() {
    const csv = buildCsv(
      ["Mês", "Total", "Novos"],
      (familyMembersQuery.data ?? []).map((d) => [d.month, String(d.total), String(d.new)])
    );
    downloadCsv(csv, "relatorio-clientes.csv");
  }

  function exportPatientsCsv() {
    const csv = buildCsv(
      ["Mês", "Total", "Novos"],
      (patientsQuery.data ?? []).map((d) => [d.month, String(d.total), String(d.new)])
    );
    downloadCsv(csv, "relatorio-pacientes.csv");
  }

  function exportSosCsv() {
    const sosData = sosQuery.data;
    if (!sosData) return;
    const csv = buildCsv(
      ["Data", "Total", "Confirmados", "Resolvidos"],
      sosData.byDate.map((d) => [
        d.date,
        String(d.total),
        String(d.acknowledged),
        String(d.resolved),
      ])
    );
    downloadCsv(csv, "relatorio-sos.csv");
  }

  function exportCaregiversCsv() {
    const csv = buildCsv(
      ["Cuidador", "Turnos", "Concluídos", "Cancelados", "Checklists"],
      (caregiversQuery.data ?? []).map((d) => [
        d.caregiverName,
        String(d.totalShifts),
        String(d.completedShifts),
        String(d.cancelledShifts),
        String(d.completedChecklists),
      ])
    );
    downloadCsv(csv, "relatorio-cuidadores.csv");
  }

  function exportSatisfactionCsv() {
    const csv = buildCsv(
      ["Cuidador", "Avaliações", "Média", "NPS"],
      (satisfactionQuery.data?.byCaregiver ?? []).map((d) => [
        d.caregiverName,
        String(d.total),
        d.avgSatisfaction != null ? String(d.avgSatisfaction) : "",
        d.nps != null ? String(d.nps) : "",
      ])
    );
    downloadCsv(csv, "relatorio-satisfacao.csv");
  }

  return (
    <div className="space-y-6">
      {!canAccessReports && <FeatureUpgradePrompt featureName="Relatórios" />}

      {canAccessReports && (
        <>
          {summaryQuery.isLoading ? (
            <SummaryCardsSkeleton />
          ) : (
            summaryQuery.data && <SummaryCards summary={summaryQuery.data} />
          )}

          <ReportsFilters onFilterChange={handleFilterChange} />

          <div className="grid gap-6 md:grid-cols-2">
            <ShiftsReport
              data={shiftsQuery.data ?? []}
              loading={isPending}
              onExport={exportShiftsCsv}
            />
            <ChecklistsReport
              data={checklistsQuery.data ?? []}
              loading={isPending}
              onExport={exportChecklistsCsv}
            />
          </div>

          <PatientsGrowthReport
            data={patientsQuery.data ?? []}
            loading={isPending}
            onExport={exportPatientsCsv}
          />

          <FamilyMembersGrowthReport
            data={familyMembersQuery.data ?? []}
            loading={familyMembersQuery.isLoading}
            onExport={exportFamilyMembersCsv}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <SosReport
              data={
                sosQuery.data ?? {
                  summary: {
                    total: 0,
                    active: 0,
                    acknowledged: 0,
                    resolved: 0,
                    avgResponseTimeMinutes: null,
                  },
                  byPatient: [],
                  byDate: [],
                }
              }
              loading={sosQuery.isLoading}
              onExport={exportSosCsv}
            />
            <CaregiversReport
              data={caregiversQuery.data ?? []}
              loading={caregiversQuery.isLoading}
              onExport={exportCaregiversCsv}
            />
          </div>

          <SatisfactionReport
            data={
              satisfactionQuery.data ?? {
                summary: { avgSatisfaction: null, nps: null, totalRatings: 0 },
                byCaregiver: [],
                byDate: [],
              }
            }
            loading={satisfactionQuery.isLoading}
            onExport={exportSatisfactionCsv}
          />

          <ComplianceSection />

          <OnboardingSection />
        </>
      )}
    </div>
  );
}
