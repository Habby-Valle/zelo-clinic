import { Suspense } from "react";
import { ContractsListClient } from "@/features/contracts";

export const metadata = { title: "Contratos — Zelo Clinic" };

export default function ContractsPage() {
  return (
    <Suspense>
      <ContractsListClient />
    </Suspense>
  );
}
