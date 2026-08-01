import { Suspense } from "react";
import { CostReportClient } from "@/features/cost-report/components";

export const metadata = { title: "Relatório de Custos — Zelo Clinic" };

export default function CostReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatório de Custos</h1>
        <p className="mt-1 text-muted-foreground">
          Custo dos turnos realizados conforme os preços dos contratos — sem fatura, a cobrança é
          feita pela clínica fora do Zelo.
        </p>
      </div>
      <Suspense fallback={null}>
        <CostReportClient />
      </Suspense>
    </div>
  );
}
