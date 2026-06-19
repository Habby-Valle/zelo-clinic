import { Suspense } from "react";
import { ReportsClient } from "@/features/reports";

export const metadata = { title: "Relatórios — Zelo Clinic" };

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="mt-1 text-muted-foreground">Análises e exportações de dados da clínica.</p>
      </div>
      <Suspense fallback={null}>
        <ReportsClient />
      </Suspense>
    </div>
  );
}
