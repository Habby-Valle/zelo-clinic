import { Suspense } from "react";
import { ReportsClient } from "@/features/reports";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Relatórios</h1>
        <p className="text-sm text-zinc-500">Análises e exportações de dados da clínica.</p>
      </div>
      <Suspense fallback={null}>
        <ReportsClient />
      </Suspense>
    </div>
  );
}
